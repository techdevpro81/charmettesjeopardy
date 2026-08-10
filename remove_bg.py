import sys
from PIL import Image

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If the pixel is mostly white, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

remove_white_bg(r"c:\Users\s_wri\.gemini\antigravity-ide\scratch\charmettes-jeopardy\public\gold-rose.png", r"c:\Users\s_wri\.gemini\antigravity-ide\scratch\charmettes-jeopardy\public\gold-rose-trans.png")
remove_white_bg(r"c:\Users\s_wri\.gemini\antigravity-ide\scratch\charmettes-jeopardy\public\gold-leaves.png", r"c:\Users\s_wri\.gemini\antigravity-ide\scratch\charmettes-jeopardy\public\gold-leaves-trans.png")
print("Done")
