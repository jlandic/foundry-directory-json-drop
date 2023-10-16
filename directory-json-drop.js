const importFiles = (files, fn) => {
  for (let file of files) {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        try {
          fn(JSON.parse(reader.result));
        } catch (err) {
          console.log(err);
        }
      },
      false
    );
    reader.readAsText(file);
  }
};

const dropInFolder = (files, folderId) => {
  importFiles(files, async (documents) => {
    const folder = game.folders.get(folderId);

    console.log(
      documents.map((document) => ({ ...document, folder: folderId }))
    );

    await folder.documentClass.create(
      documents.map((document) => ({ ...document, folder: folderId }))
    );
  });
};

const dropInRootFolder = (files, app) => {
  importFiles(files, async (documents) => {
    console.log(document);
    await game[app.tabName].documentClass.create(documents);
  });
};

Hooks.on("renderSidebarTab", (app, html) => {
  html.find(".directory-item").on("drop", async function (event) {
    event.originalEvent.preventDefault();
    event.stopPropagation();

    const files = event.originalEvent.dataTransfer.files;

    // File is dropped on a document
    if (event.currentTarget.attributes["data-document-id"] !== undefined) {
      const document = game[app.tabName].get(
        event.currentTarget.attributes["data-document-id"].value
      );
      console.log("Dropped onto document", document.id);

      // ...inside the root folder
      if (document.folder === null) {
        dropInRootFolder(files, app);
      } else {
        dropInFolder(files, document.folder.id);
      }
    }

    // File is dropped on a folder
    else if (event.currentTarget.attributes["data-folder-id"] !== undefined) {
      console.log(
        "Dropped onto folder",
        event.currentTarget.attributes["data-folder-id"]
      );
      dropInFolder(
        files,
        event.currentTarget.attributes["data-folder-id"].value
      );
    }
  });

  html.find(".directory-list").on("drop", async function (event) {
    event.originalEvent.preventDefault();

    dropInRootFolder(event.originalEvent.dataTransfer.files, app);
  });
});
