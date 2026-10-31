import shutil
from datetime import datetime
from pathlib import Path

CATEGORIAS = {
    "Documentos": {
        ".pdf", ".doc", ".docx", ".txt", ".odt", ".md", ".rtf", ".tex",
        ".pages", ".epub", ".mobi",
    },
    "Apresentações": {".ppt", ".pptx", ".odp", ".key"},
    "Planilhas": {".xls", ".xlsx", ".xlsm", ".csv", ".tsv", ".ods", ".numbers"},
    "Imagens": {
        ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".heic", ".heif",
        ".bmp", ".tif", ".tiff", ".ico", ".avif",
        # fotos em RAW, de câmeras
        ".raw", ".cr2", ".cr3", ".nef", ".arw", ".dng", ".orf", ".rw2",
    },
    "Design e 3D": {
        ".psd", ".ai", ".xcf", ".sketch", ".fig", ".indd", ".eps",
        ".dwg", ".dxf", ".stl", ".obj", ".fbx", ".blend",
    },
    "Vídeos": {
        ".mp4", ".mov", ".avi", ".mkv", ".webm", ".wmv", ".flv",
        ".m4v", ".mpg", ".mpeg", ".3gp",
    },
    "Áudio": {
        ".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac", ".wma",
        ".aiff", ".opus", ".mid", ".midi",
    },
    "Compactados": {".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", ".tgz"},
    "Bancos de dados": {
        ".sql", ".db", ".sqlite", ".sqlite3", ".mdb", ".accdb", ".dbf", ".parquet",
    },
    "Código": {
        ".js", ".ts", ".jsx", ".tsx", ".py", ".ipynb", ".html", ".css", ".scss",
        ".vue", ".java", ".c", ".cpp", ".h", ".cs", ".go", ".rs", ".php", ".rb",
        ".swift", ".kt", ".sh", ".bat", ".ps1", ".json", ".xml", ".yml", ".yaml",
        ".toml", ".ini",
    },
    "Executáveis e instaladores": {
        ".exe", ".msi", ".apk", ".dmg", ".deb", ".rpm", ".appimage", ".jar", ".iso",
    },
    "Fontes": {".ttf", ".otf", ".woff", ".woff2"},
}
CATEGORIA_PADRAO = "Outros"


def categorize(nome_arquivo: str) -> str:
    extensao = Path(nome_arquivo).suffix.lower()
    for categoria, extensoes in CATEGORIAS.items():
        if extensao in extensoes:
            return categoria
    return CATEGORIA_PADRAO


def caminho_livre(destino: Path) -> Path:
    if not destino.exists():
        return destino
    contador = 1
    while True:
        candidato = destino.with_name(f"{destino.stem} ({contador}){destino.suffix}")
        if not candidato.exists():
            return candidato
        contador += 1


def organize_file(origem: Path, base: Path) -> dict:
    origem = Path(origem)
    base = Path(base)
    data = datetime.fromtimestamp(origem.stat().st_mtime)
    categoria = categorize(origem.name)

    pasta = base / categoria / data.strftime("%Y-%m")
    pasta.mkdir(parents=True, exist_ok=True)
    destino = caminho_livre(pasta / origem.name)

    tamanho = origem.stat().st_size
    shutil.move(str(origem), str(destino))

    return {
        "nome": destino.name,
        "categoria": categoria,
        "destino": destino.relative_to(base).as_posix(),
        "tamanho": tamanho,
        "data": data,
    }