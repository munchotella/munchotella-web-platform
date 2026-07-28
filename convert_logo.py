from PIL import Image

def convert_logo_to_mask(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Grayscale calculation
        gray = int(item[0]*0.3 + item[1]*0.59 + item[2]*0.11)
        # Strict threshold to remove jpeg artifacts and white background
        if gray > 180:
            newData.append((255, 255, 255, 0)) # Transparent
        else:
            newData.append((255, 255, 255, 255)) # Pure white logo
            
    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    import os
    base_dir = r"D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\public"
    convert_logo_to_mask(os.path.join(base_dir, "logo_official.png"), os.path.join(base_dir, "logo_official.png"))
    print("Official Logo fixed!")
