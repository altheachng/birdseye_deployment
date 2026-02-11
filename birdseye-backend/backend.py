from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_litter_mask_v4(image, texture_thresh=15, min_blob_area=50):

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # color based mask 
    h = hsv[:, :, 0]
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]

    color_mask = ( (h >= 5) & (h <= 50) & (s > 8) & (v > 25) )

    pure_white = (s < 8) & (v > 220)
    pure_black = v < 25
    metal_gray = (s < 15) & ((h < 5) | (h > 50))
    non_litter = pure_white | pure_black | metal_gray

    # texture mask
    kernel_size = 15
    blur = cv2.GaussianBlur(gray, (kernel_size, kernel_size), 0)
    squared_diff = (gray.astype(float) - blur.astype(float)) ** 2
    texture = cv2.GaussianBlur(squared_diff, (kernel_size, kernel_size), 0)
    texture = np.sqrt(texture)
    texture_norm = ((texture / (texture.max() + 1e-6)) * 255).astype(np.uint8)
    texture_mask = texture_norm > texture_thresh

    # combine masks
    litter_mask = color_mask & ~non_litter & texture_mask
    litter_mask = litter_mask.astype(np.uint8)

    # morphological cleanup
    litter_mask = cv2.morphologyEx(
        litter_mask, cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    )
    litter_mask = cv2.morphologyEx(
        litter_mask, cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    )
    litter_mask = cv2.morphologyEx(
        litter_mask, cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35))
    )

    # remove small blobs 
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(litter_mask)
    clean_mask = np.zeros_like(litter_mask)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] >= min_blob_area:
            clean_mask[labels == i] = 1

    return clean_mask.astype(bool)


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
   
    try:
        # Read uploaded file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Invalid image file"}
            )
        
        # Convert to HSV
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Step 1: Create litter mask
        litter_mask = create_litter_mask_v4(image, texture_thresh=15, min_blob_area=50)
        
        # Check if litter detected
        if np.sum(litter_mask) == 0:
            return JSONResponse(content={
                "success": True,
                "wet_percentage": 0.0,
                "processed_image": None,
                "message": "No litter detected in image"
            })
        
        # Step 2: Detect wet areas using V channel
        v_channel = hsv[:, :, 2]
        litter_v = v_channel[litter_mask]
        v_threshold = np.percentile(litter_v, 20)  # Darkest 20% = wet
        
        wet_mask = (v_channel < v_threshold) & litter_mask
        
        # Step 3: Cleanup wet mask
        wet_mask = wet_mask.astype(np.uint8)
        wet_mask = cv2.morphologyEx(
            wet_mask, cv2.MORPH_OPEN,
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        )
        wet_mask = cv2.morphologyEx(
            wet_mask, cv2.MORPH_CLOSE,
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
        )
        
        # Remove small blobs
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(wet_mask)
        clean_wet_mask = np.zeros_like(wet_mask, dtype=bool)
        for i in range(1, num_labels):
            if stats[i, cv2.CC_STAT_AREA] >= 150:
                clean_wet_mask[labels == i] = True
        
        # Step 4: Calculate wet percentage
        wet_percentage = (np.sum(clean_wet_mask) / np.sum(litter_mask)) * 100
        
        # Step 5: Create visualization (red overlay on wet areas)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        wet_vis = image_rgb.copy()
        wet_vis[clean_wet_mask] = [255, 0, 0]  # Red color for wet areas
        result_image = cv2.addWeighted(image_rgb, 0.7, wet_vis, 0.3, 0)
        
        # Step 6: Convert result to base64
        result_pil = Image.fromarray(result_image)
        buffered = BytesIO()
        result_pil.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        result_base64 = f"data:image/jpeg;base64,{img_str}"
        
        return JSONResponse(content={
            "success": True,
            "wet_percentage": round(wet_percentage, 1),
            "processed_image": result_base64
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )


@app.get("/")
async def root():
    return {"message": "Birdseye API is running"}