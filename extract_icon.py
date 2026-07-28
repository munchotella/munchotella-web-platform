from PIL import Image

def get_icon(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # First, let's remove the white/gray background completely to make it clean
    datas = img.getdata()
    newData = []
    bg_color = (181, 183, 182) # Approximate background of the user's file
    
    for item in datas:
        r, g, b, a = item
        # If it's close to the background color or white, make it transparent
        if r > 160 and g > 160 and b > 160 and abs(r-g)<15 and abs(g-b)<15:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    
    img.putdata(newData)
    
    # Now find the first and second horizontal clusters
    width, height = img.size
    row_has_color = []
    for y in range(height):
        has_color = False
        for x in range(width):
            if img.getpixel((x, y))[3] > 10:
                has_color = True
                break
        row_has_color.append(has_color)
        
    # Find the gap
    in_shape = False
    shape_bounds = []
    start_y = 0
    for y in range(height):
        if row_has_color[y] and not in_shape:
            in_shape = True
            start_y = y
        elif not row_has_color[y] and in_shape:
            in_shape = False
            shape_bounds.append((start_y, y))
            
    if in_shape:
        shape_bounds.append((start_y, height-1))
        
    print("Found shapes at Y-bounds:", shape_bounds)
    
    # The first shape is the icon!
    if len(shape_bounds) >= 1:
        icon_top = shape_bounds[0][0]
        icon_bottom = shape_bounds[0][1]
        
        # Find X bounds for this shape
        min_x = width
        max_x = 0
        for y in range(icon_top, icon_bottom+1):
            for x in range(width):
                if img.getpixel((x, y))[3] > 10:
                    if x < min_x: min_x = x
                    if x > max_x: max_x = x
                    
        print(f"Icon X-bounds: {min_x} to {max_x}")
        
        # Crop!
        icon_img = img.crop((min_x, icon_top, max_x, icon_bottom))
        icon_img.save(output_path, "PNG")
        print("Icon extracted successfully!")
    else:
        print("Failed to find shapes")

if __name__ == "__main__":
    input_file = r"D:\Aplicatia Munchotella\resurse\ecrane de start\logo fara background.png"
    output_file = r"D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\public\logo_icon_only.png"
    get_icon(input_file, output_file)
