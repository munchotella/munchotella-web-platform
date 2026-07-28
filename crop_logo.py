from PIL import Image, ImageChops

def trim_and_transparent(input_path, output_path):
    # Open image
    img = Image.open(input_path).convert("RGBA")
    
    # 1. Remove white background (make it transparent)
    datas = img.getdata()
    newData = []
    for item in datas:
        # If pixel is very close to white, make transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item) # Keep original color!
            
    img.putdata(newData)
    
    # 2. Trim transparent borders
    bg = Image.new("RGBA", img.size, (255, 255, 255, 0))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Cropped to: {img.size}")

if __name__ == "__main__":
    import os
    input_file = r"D:\Aplicatia Munchotella\resurse\ecrane de start\logo fara background.png"
    output_file = r"D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\public\logo_official.png"
    trim_and_transparent(input_file, output_file)
