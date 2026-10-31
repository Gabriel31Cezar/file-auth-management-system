import tempfile
from pathlib import Path

from organizer import organize_file

NOMES = [
    "relatorio.pdf", "foto.jpg", "foto_camera.cr2", "video.mp4", "musica.mp3",
    "dados.csv", "backup.zip", "main.py", "consulta.sql", "slides.pptx",
    "fonte.ttf", "instalador.exe", "arquivo.xyz", "foto.jpg",
]

with tempfile.TemporaryDirectory() as tmp:
    entrada = Path(tmp) / "entrada"
    base = Path(tmp) / "organizado"
    entrada.mkdir()

    for nome in NOMES:
        arquivo = entrada / nome
        arquivo.write_text("conteudo de teste")
        r = organize_file(arquivo, base)
        print(f"{nome:18} -> {r['categoria']:27} {r['destino']}")