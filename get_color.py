import re
import base64
from io import BytesIO
from PIL import Image

def get_dominant_color():
    with open(r'D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\public\logo culoare buna.svg', 'r') as f:
        content = f.read()

    match = re.search(r'data:image/png;base64,([^"]+)', content)
    if not match:
        print("No base64 png found")
        return

    b64_data = match.group(1)
    image_data = base64.b64decode(b64_data)
    img = Image.open(BytesIO(image_data))
    img = img.convert('RGBA')
    colors = img.getcolors(maxcolors=1000000)
    if not colors:
        print("Too many colors")
        return

    # Find the most frequent colors that aren't transparent and aren't purely white/black
    valid_colors = []
    img.save(r'D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\public\logo_culoare_buna_extracted.png')
    print("Saved to public/logo_culoare_buna_extracted.png")

get_dominant_color()
