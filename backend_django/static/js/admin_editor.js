
document.addEventListener('DOMContentLoaded', function () {
    // Procura pelo campo de conteúdo (padrão do Django Admin é id_content)
    const contentField = document.getElementById('id_content');

    if (contentField) {
        // Inicializa o EasyMDE
        const easyMDE = new EasyMDE({
            element: contentField,
            spellChecker: false, // Desativar spellchecker nativo (inglês)
            autosave: {
                enabled: true,
                uniqueId: "sussurros_article_content_" + window.location.pathname, // Único por URL (add/change)
                delay: 1000,
            },
            placeholder: "Escreva o seu artigo aqui usando Markdown...",
            // Toolbar personalizada
            toolbar: [
                "bold", "italic", "strikethrough", "|",
                "heading-1", "heading-2", "heading-3", "|",
                "code", "quote", "unordered-list", "ordered-list", "|",
                "link", "image", "table", "|",
                "preview", "side-by-side", "fullscreen", "|",
                "guide"
            ],
            status: ["lines", "words", "cursor"],
            minHeight: "500px",
        });

        // Ajustes de CSS para o tema Unfold (Dark/Light mode compatibilidade básica)
        // O Unfold tem classes tailwind, o EasyMDE é CSS puro.
        contentField.classList.add('easymde-active');
    }
});
