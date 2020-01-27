var simplemde = new SimpleMDE({
  autosave: {
		enabled: false,
		uniqueId: "MyUniqueID", // This needs to be a unique ID
		delay: 1000,
	},
  element: $("#editor")[0],
  insertTexts: {
		horizontalRule: ["", "\n\n-----\n\n"],
		image: ["![](http://", ")"],
		link: ["[", "](http://)"],
		table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
	},
  promptURLs: true,
  toolbar: ["bold", "italic", "quote", "|", "heading-2", "heading-3", "|", "unordered-list", "ordered-list", "code", "table", "|", "preview", "side-by-side", "fullscreen", "guide"]
});

// const pos = simplemde.codemirror.getCursor();
// simplemde.codemirror.replaceRange(post_matter, pos);
