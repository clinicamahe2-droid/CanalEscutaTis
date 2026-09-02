/**
 * "Exportar PDF" = abrir a caixa de impressao do navegador com um print
 * stylesheet. O usuario escolhe "Salvar como PDF". Sem dependencia, offline,
 * e o resultado e um PDF de verdade.
 *
 * A pagina de Relatorios marca o container do relatorio com `.print-container`
 * e tudo o mais com `.no-print` (ver index.css).
 */
export function exportarComoPdf(titulo?: string) {
  const anterior = document.title;
  if (titulo) document.title = titulo;
  const restaurar = () => {
    document.title = anterior;
    window.removeEventListener("afterprint", restaurar);
  };
  window.addEventListener("afterprint", restaurar);
  window.print();
  // fallback caso afterprint nao dispare (alguns navegadores)
  setTimeout(restaurar, 1000);
}
