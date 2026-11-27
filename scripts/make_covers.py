import os, random

os.makedirs('public/covers', exist_ok=True)
W, H = 1600, 1000


def wrap(inner, bg="#111111"):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{bg}"/>{inner}</svg>'
    )


def grid(col="#1c1c1c", step=100):
    out = []
    for x in range(0, W + 1, step):
        out.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{col}" stroke-width="1"/>')
    for y in range(0, H + 1, step):
        out.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{col}" stroke-width="1"/>')
    return "".join(out)


mono = 'font-family="monospace" letter-spacing="4"'

# ---- 1. Ink Studio : ink bleed field
random.seed(7)
blobs = "".join(
    f'<circle cx="{random.randint(200, 1400)}" cy="{random.randint(150, 850)}" '
    f'r="{random.randint(80, 340)}" fill="none" stroke="#FF6300" '
    f'stroke-opacity="{random.uniform(.12, .4):.2f}" stroke-width="{random.choice([1, 2])}"/>'
    for _ in range(26)
)
ink = wrap(
    grid()
    + blobs
    + '<rect x="60" y="60" width="1480" height="880" fill="none" stroke="#2a2a2a"/>'
    + f'<text x="80" y="920" fill="#ffffff" fill-opacity=".5" {mono} font-size="22">INK STUDIO / 01</text>',
    "#0E0E0E",
)
open('public/covers/ink-studio.svg', 'w').write(ink)

# ---- 2. SCANIX : product UI wireframe
ui = ['<rect x="60" y="60" width="1480" height="880" fill="none" stroke="#262626"/>']
ui.append('<rect x="60" y="60" width="1480" height="80" fill="#151515"/>')
for x in range(120, 600, 120):
    ui.append(f'<rect x="{x}" y="90" width="70" height="10" fill="#3a3a3a"/>')
ui.append('<rect x="120" y="200" width="420" height="220" fill="#FF6300"/>')
ui.append('<rect x="120" y="450" width="420" height="14" fill="#3a3a3a"/>')
ui.append('<rect x="120" y="485" width="300" height="14" fill="#2c2c2c"/>')
ui.append('<rect x="120" y="520" width="360" height="14" fill="#2c2c2c"/>')
for i in range(3):
    y = 620 + i * 80
    ui.append(f'<rect x="120" y="{y}" width="300" height="60" fill="none" stroke="#2e2e2e"/>')
    ui.append(f'<circle cx="156" cy="{y + 30}" r="14" fill="#FF6300" fill-opacity=".7"/>')
    ui.append(f'<rect x="186" y="{y + 22}" width="160" height="10" fill="#333"/>')
for i in range(4):
    y = 200 + i * 160
    ui.append(f'<rect x="620" y="{y}" width="880" height="130" fill="#161616" stroke="#262626"/>')
    ui.append(f'<rect x="650" y="{y + 30}" width="{280 + i * 40}" height="12" fill="#333"/>')
    ui.append(f'<rect x="650" y="{y + 60}" width="{520 - i * 60}" height="10" fill="#262626"/>')
    ui.append(f'<rect x="650" y="{y + 92}" width="80" height="20" fill="#FF6300" fill-opacity=".8"/>')
open('public/covers/scanix.svg', 'w').write(wrap("".join(ui), "#101010"))

# ---- 3. VYBE Guitar : strings + waveform
s = []
for i in range(6):
    y = 180 + i * 130
    s.append(f'<line x1="80" y1="{y}" x2="1520" y2="{y}" stroke="#4a4a4a" stroke-width="{1 + i * 0.4}"/>')
s.append('<path d="M80 500 Q 300 300 520 500 T 960 500 T 1400 500" fill="none" stroke="#FF6300" stroke-width="3"/>')
s.append('<g fill="#FF6300">')
for i in range(40):
    h = random.Random(i).randint(30, 260)
    s.append(f'<rect x="{100 + i * 37}" y="{880 - h}" width="10" height="{h}" opacity="{0.25 + i / 80:.2f}"/>')
s.append('</g>')
s.append(f'<text x="80" y="120" fill="#8a8a8a" {mono} font-size="20">VYBE / STRING SYSTEM</text>')
open('public/covers/vybe-guitar.svg', 'w').write(wrap("".join(s), "#0D0D0D"))

# ---- 4. Rig Music : modular rack
r = []
random.seed(3)
for row in range(3):
    for col in range(6):
        x = 70 + col * 250
        y = 110 + row * 280
        r.append(f'<rect x="{x}" y="{y}" width="220" height="240" fill="#161616" stroke="#2a2a2a"/>')
        for k in range(5):
            r.append(f'<circle cx="{x + 30 + k * 44}" cy="{y + 40}" r="12" fill="#2e2e2e"/>')
        r.append(f'<circle cx="{x + 180}" cy="{y + 40}" r="18" fill="none" stroke="#FF6300" stroke-width="2"/>')
        for k in range(4):
            r.append(
                f'<rect x="{x + 24}" y="{y + 110 + k * 26}" '
                f'width="{100 + random.randint(0, 60)}" height="5" fill="#333"/>'
            )
r.append(f'<text x="70" y="80" fill="#FF6300" {mono} font-size="20">RIG // MODULAR</text>')
open('public/covers/rig-music.svg', 'w').write(wrap("".join(r), "#111111"))

# ---- 5. Weligama Bay Eco Villa : coastal minimal
w = []
w.append('<rect x="0" y="640" width="1600" height="360" fill="#161514"/>')
w.append('<circle cx="1180" cy="330" r="150" fill="#FF6300" fill-opacity="0.9"/>')
for i in range(4):
    w.append(
        f'<path d="M0 {700 + i * 70} Q 400 {660 + i * 70} 800 {700 + i * 70} '
        f'T 1600 {700 + i * 70}" fill="none" stroke="#2b2a28" stroke-width="1.5"/>'
    )
w.append('<path d="M300 640 L300 470 L560 470 L560 640 Z" fill="#0B0B0B" stroke="#3a3936"/>')
w.append('<path d="M260 470 L430 360 L600 470" fill="none" stroke="#3a3936" stroke-width="2"/>')
w.append('<rect x="340" y="520" width="60" height="120" fill="#FF6300" fill-opacity=".25"/>')
w.append('<rect x="470" y="520" width="60" height="120" fill="#FF6300" fill-opacity=".55"/>')
w.append(f'<text x="80" y="120" fill="#8b8a86" {mono} font-size="20">WELIGAMA BAY — ECO VILLA</text>')
open('public/covers/weligama-bay.svg', 'w').write(wrap("".join(w), "#0E0E0D"))

# ---- 6. HeritageLK : arched heritage geometry
h = []
for i in range(9):
    cx = 800
    rad = 560 - i * 58
    stroke = "#FF6300" if i == 4 else "#2b2a27"
    width = 2 if i == 4 else 1
    h.append(
        f'<path d="M {cx - rad} 900 L {cx - rad} 420 A {rad} {rad} 0 0 1 {cx + rad} 420 '
        f'L {cx + rad} 900" fill="none" stroke="{stroke}" stroke-width="{width}"/>'
    )
for i in range(6):
    h.append(f'<line x1="{200 + i * 240}" y1="700" x2="{200 + i * 240}" y2="1000" stroke="#1e1d1b"/>')
h.append(f'<text x="80" y="120" fill="#8b8a86" {mono} font-size="20">HERITAGE.LK / DISCOVERY</text>')
open('public/covers/heritagelk.svg', 'w').write(wrap("".join(h), "#0C0C0B"))

# ---- 7. EDITH : AI assistant terminal
e = ['<rect x="80" y="80" width="1440" height="840" fill="#101010" stroke="#232323"/>']
e.append('<rect x="80" y="80" width="1440" height="52" fill="#151515"/>')
for i, c in enumerate(['#3a3a3a', '#3a3a3a', '#FF6300']):
    e.append(f'<circle cx="{116 + i * 26}" cy="106" r="7" fill="{c}"/>')
lines = [
    '> edith init',
    '  loading models ........ ok',
    '  listening for intent .. ok',
    '  automation pipeline ... ready',
    '',
    '> run workflow "daily-report"',
    '  [####################] 100%',
    '  output saved to /reports',
]
for i, t in enumerate(lines):
    color = "#FF6300" if t.startswith('>') else "#8a8a8a"
    e.append(
        f'<text x="120" y="{200 + i * 58}" fill="{color}" font-family="monospace" '
        f'font-size="24" letter-spacing="1">{t}</text>'
    )
e.append('<circle cx="1400" cy="800" r="90" fill="none" stroke="#FF6300" stroke-width="1" stroke-dasharray="4 8"/>')
open('public/covers/edith.svg', 'w').write(wrap("".join(e), "#0A0A0A"))

# ---- 8. RCPAS : institutional web design
p = ['<rect x="80" y="80" width="1440" height="840" fill="#141414" stroke="#262626"/>']
p.append('<rect x="80" y="80" width="1440" height="300" fill="#0d0d0d"/>')
p.append('<rect x="140" y="160" width="360" height="26" fill="#FF6300"/>')
p.append('<rect x="140" y="210" width="600" height="18" fill="#333"/>')
p.append('<rect x="140" y="244" width="440" height="18" fill="#282828"/>')
for i in range(3):
    x = 140 + i * 330
    p.append(f'<rect x="{x}" y="430" width="290" height="200" fill="#181818" stroke="#282828"/>')
    p.append(f'<rect x="{x + 24}" y="462" width="90" height="8" fill="#FF6300"/>')
    p.append(f'<rect x="{x + 24}" y="492" width="200" height="10" fill="#333"/>')
    p.append(f'<rect x="{x + 24}" y="514" width="160" height="10" fill="#2a2a2a"/>')
p.append('<rect x="140" y="690" width="1240" height="1" fill="#282828"/>')
for i in range(4):
    p.append(f'<rect x="{140 + i * 330}" y="730" width="240" height="10" fill="#2a2a2a"/>')
    p.append(f'<rect x="{140 + i * 330}" y="754" width="180" height="10" fill="#222222"/>')
open('public/covers/rcpas.svg', 'w').write(wrap("".join(p), "#101010"))

print("covers written:", sorted(os.listdir('public/covers')))
