from PIL import Image

def super_crop(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    mask = Image.new("L", img.size, 0)
    mask_data = []
    
    for item in datas:
        r, g, b, a = item
        # If it's transparent, ignore
        if a < 50:
            mask_data.append(0)
            continue
            
        # If it's grayscale (white, gray, black), ignore
        # Noise is usually gray or white. The logo is gold.
        if max(r,g,b) - min(r,g,b) > 20:
            mask_data.append(255)
        else:
            mask_data.append(0)
            
    mask.putdata(mask_data)
    bbox = mask.getbbox()
    if bbox:
        print("Real logo bbox:", bbox)
        # Add 10px padding
        padded_bbox = (max(0, bbox[0]-10), max(0, bbox[1]-10), min(img.width, bbox[2]+10), min(img.height, bbox[3]+10))
        img = img.crop(padded_bbox)
        img.save(output_path, "PNG")
    else:
        print("Could not find logo")

if __name__ == "__main__":
    import os
    # Use the original image before my modifications
    input_file = r"D:\Aplicatia Munchotella\resurse\ecrane de start\logo fara background.png"
    output_file = r"D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\public\logo_official.png"
    super_crop(input_file, output_file)
