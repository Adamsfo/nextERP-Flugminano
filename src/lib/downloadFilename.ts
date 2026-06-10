/**
 * Extrai o nome do arquivo do header Content-Disposition (RFC 5987 / filename quoted).
 */
export function parseFilenameFromContentDisposition(
    header: string | null
): string | undefined {
    if (!header) return undefined;

    const utf8Match = header.match(/filename\*=UTF-8''([^;\n]+)/i);
    if (utf8Match?.[1]) {
        try {
            return decodeURIComponent(utf8Match[1].trim());
        } catch {
            return utf8Match[1].trim();
        }
    }

    const quotedMatch = header.match(/filename="((?:\\.|[^"\\])*)"/i);
    if (quotedMatch?.[1]) {
        return quotedMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    const unquotedMatch = header.match(/filename=([^;\n]+)/i);
    if (unquotedMatch?.[1]) {
        return unquotedMatch[1].trim().replace(/^["']|["']$/g, '');
    }

    return undefined;
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
