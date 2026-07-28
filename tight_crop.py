from PIL import Image, ImageChops

def smart_crop(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Create a mask of pixels where alpha > 10
    mask = Image.new("L", img.size, 0)
    datas = img.getdata()
    mask_data = []
    for item in datas:
        if item[3] > 10:
            mask_data.append(255)
        else:
            mask_data.append(0)
    mask.putdata(mask_data)
    
    # Get bounding box of the mask
    bbox = mask.getbbox()
    if bbox:
        print("Found bbox:", bbox)
        img = img.crop(bbox)
        img.save(output_path, "PNG")
    else:
        print("No bbox found, image is fully transparent?")

if __name__ == "__main__":
    import os
    input_file = r"D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\public\logo_official.png"
    smart_crop(input_file, input_file)
