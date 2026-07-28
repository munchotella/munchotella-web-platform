import re

with open(r'D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\public\logo-bun.svg', 'r', encoding='utf-8') as f:
    svg = f.read()

# Remove xml declaration and doctype if any
svg = re.sub(r'<\?xml[^>]+\?>', '', svg)

# Replace namespaces and other root attributes
svg = re.sub(r'<svg[^>]+>', '<svg viewBox="0 0 368 374.66666" className={className} xmlns="http://www.w3.org/2000/svg">', svg)

# Remove metadata and defs
svg = re.sub(r'<metadata[^>]*>.*?</metadata>', '', svg, flags=re.DOTALL)
svg = re.sub(r'<defs[^>]*>.*?</defs>', '', svg, flags=re.DOTALL)
svg = re.sub(r'<g[^>]*>\s*<text[^>]*>.*?</text>\s*</g>', '', svg, flags=re.DOTALL)

# Convert styles to camelCase attributes
# style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" -> fill="currentColor" fillOpacity="1" fillRule="nonzero"
def style_repl(match):
    style = match.group(1)
    if 'fill:#ffffff' in style:
        style = style.replace('fill:#ffffff', 'fill:"currentColor"')
    else:
        style = style.replace('fill:#f68420', 'fill:"#f68420"')
    
    style = style.replace('fill-opacity:1', 'fillOpacity="1"')
    style = style.replace('fill-rule:nonzero', 'fillRule="nonzero"')
    style = style.replace('stroke:none', 'stroke="none"')
    
    # Format properly
    parts = [p for p in style.split(';') if p]
    attrs = []
    for p in parts:
        if ':' in p:
            k, v = p.split(':', 1)
            # if not already quoted
            if '"' not in v:
                v = f'"{v}"'
            attrs.append(f'{k}={v}')
        else:
            attrs.append(p)
    return ' '.join(attrs)

svg = re.sub(r'style="([^"]+)"', style_repl, svg)

# Hardcode currentColor replacement just in case
svg = svg.replace('fill:"currentColor"', 'fill="currentColor"')
svg = svg.replace('fill:"#f68420"', 'fill="#f68420"')
svg = svg.replace('fill-opacity', 'fillOpacity')
svg = svg.replace('fill-rule', 'fillRule')
svg = svg.replace('writing-mode', 'writingMode')
svg = svg.replace('font-variant', 'fontVariant')
svg = svg.replace('font-weight', 'fontWeight')
svg = svg.replace('font-size', 'fontSize')
svg = svg.replace('font-family', 'fontFamily')
svg = svg.replace('-inkscape-font-specification', 'inkscapeFontSpecification')

# Remove inkscape font spec
svg = re.sub(r'inkscapeFontSpecification="[^"]+"', '', svg)


component = f"""import React from 'react';

export default function LogoSVG({{ className }}: {{ className?: string }}) {{
  return (
    {svg.strip()}
  );
}}
"""

with open(r'D:\Aplicatia Munchotella\fisiere aplicatie\web-platform\src\components\LogoSVG.tsx', 'w', encoding='utf-8') as f:
    f.write(component)
print("Done")
