const path = require("path");
const fs = require("fs");

// Most options demonstrate the non-default behavior
var simplemde = new SimpleMDE({
  autofocus: true,
  autosave: {
    enabled: true,
    uniqueId: "MyUniqueID",
    delay: 1000
  },
  blockStyles: {
    bold: "__",
    italic: "_"
  },
  element: document.getElementById("mde"),
  forceSync: true,
  hideIcons: ["preview"],
  indentWithTabs: false,
  initialValue: "Hello world!",
  insertTexts: {
    horizontalRule: ["", "\n\n-----\n\n"],
    image: ["![](http://", ")"],
    link: ["[", "](http://)"],
    table: [
      "",
      "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"
    ]
  },
  lineWrapping: true,
  parsingConfig: {
    allowAtxHeaderWithoutSpace: true,
    strikethrough: true,
    underscoresBreakWords: true
  },
  placeholder: "Type here...",
  renderingConfig: {
    singleLineBreaks: false,
    codeSyntaxHighlighting: true
  },
  shortcuts: {
    drawTable: "Cmd-Alt-T"
  },
  showIcons: ["code", "table"],
  spellChecker: true,
  status: true,
  status: ["autosave", "lines", "words", "cursor"], // Optional usage
  status: [
    "autosave",
    "lines",
    "words",
    "cursor",
    {
      className: "keystrokes",
      defaultValue: function(el) {
        this.keystrokes = 0;
        el.innerHTML = "0 Keystrokes";
      },
      onUpdate: function(el) {
        el.innerHTML = ++this.keystrokes + " Keystrokes";
      }
    }
  ], // Another optional usage, with a custom status bar item that counts keystrokes
  styleSelectedText: true,
  tabSize: 4
});

simplemde.codemirror.on("change", function() {
  $("article.page")
    .find(".content .text")
    .html(simplemde.options.previewRender(simplemde.value()));
});

simplemde.codemirror.on("refresh", function() {
  if (simplemde.isFullscreenActive()) {
    $("body").addClass("simplemde-fullscreen");
    $("body")
      .find(".editor-preview-side,.CodeMirror-scroll")
      .css({ marginTop: "50px" });
  } else {
    $("body")
      .find(".editor-preview-side,.CodeMirror-scroll")
      .css({ marginTop: "0px" });
  }
});

Date.prototype.toDateInputValue = function() {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};
$(document).ready(function() {
  let date = new Date().toDateInputValue();
  $("#inputDate").val(date);
  $("article.page")
    .find("h3.byline time")
    .html(date);
});
// Add the following code if you want the name of the file appear on select
$(".custom-file-input").on("change", function() {
  var fileName = $(this)
    .val()
    .split("\\")
    .pop();
  $(this)
    .siblings(".custom-file-label")
    .addClass("selected")
    .html(fileName);
  if (
    $(this)["0"].files["0"].type == "image/jpeg" ||
    $(this)["0"].files["0"].type == "image/png" ||
    $(this)["0"].files["0"].type == "image/gif"
  ) {
    var img = fs
      .readFileSync(path.resolve($(this)["0"].files["0"].path))
      .toString("base64");
    $("article.page")
      .find(".big-image")
      .css({
        backgroundImage:
          "url(data:" + $(this)["0"].files["0"].type + ";base64," + img + ")"
      });
  }
});
$("#inputAuthor").on("input", function() {
  $("article.page")
    .find("h3.byline .author")
    .html($(this).val());
});
$("#inputTitle").on("input", function() {
  $("article.page")
    .find("h1.title")
    .html($(this).val());
});
$("#inputTitle2").on("input", function() {
  $("article.page")
    .find("h2.description")
    .html($(this).val());
});
$(function() {
  $("#compile-button").click(function() {
    let output = {};
    let img_path = "";
    if ($(".custom-file-input")["0"].files.length < 1) {
      alert("No File Selected!");
    } else {
      img_path = path.resolve($(".custom-file-input")["0"].files["0"].path);
      output.image = $(".custom-file-input")
        .val()
        .split("\\")
        .pop();
      if ($("#inputAuthor").val() == "") alert("No Author Given!");
      else {
        output.author = $("#inputAuthor").val();
        if ($("#inputDate").val() == "") {
          alert("No Date Given!");
        } else {
          output.date = $("#inputDate").val();
          if ($("#inputTitle").val() == "") {
            alert("No Title Given!");
          } else {
            output.title = $("#inputTitle").val();
            if ($("#inputTitle2").val() == "") {
              alert("No Second Title Given!");
            } else {
              output.title_secondary = $("#inputTitle2").val();
              if ($("textarea").val() == "") {
                alert("No Content Given!");
              } else {
                output.content = simplemde.options.previewRender(
                  $("textarea").val()
                );
                var fs = require("fs");
                var JSZip = require("jszip");
                var FileSaver = require("file-saver");

                fs.readFile(img_path, function(err, data) {
                  if (err) throw err;
                  var zip = new JSZip();
                  zip.file("post_X.json", JSON.stringify(output));
                  var img = zip.folder("images");
                  img.file(output.image, data);
                  zip.generateAsync({ type: "blob" }).then(function(content) {
                    // see FileSaver.js
                    FileSaver.saveAs(content, output.date + "-post.zip");
                  });
                });
              }
            }
          }
        }
      }
    }
  });
});
