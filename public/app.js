let editor;

window.addEventListener("DOMContentLoaded", () => {
  editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    mode: "javascript",
    tabSize: 2,
    indentUnit: 2,
    autofocus: true,
  });

  const languageSelect = document.getElementById("language");
  languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    let mode = "javascript";
    if (lang === "python") mode = "python";
    if (lang === "java") mode = "text/x-java";
    editor.setOption("mode", mode);
  });

  document.getElementById("analyzeBtn").addEventListener("click", analyzeCode);
});

async function analyzeCode() {
  setStatus("Sending to AI...");
  clearResult();

  const code = editor.getValue();
  const language = document.getElementById("language").value;
  const mode = document.getElementById("mode").value;
  const provider = document.getElementById("provider").value;

  try {
    const resp = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, mode, provider }),
    });
    const data = await resp.json();
    setStatus("");
    document.getElementById("result").textContent = data.raw;
    document.getElementById("structured").textContent = JSON.stringify(data.parsed, null, 2);
    if (data.warning) setStatus(data.warning);
  } catch (err) {
    setStatus("Error: " + err.message);
  }
}

function setStatus(msg) {
  document.getElementById("status").textContent = msg || "";
}

function clearResult() {
  document.getElementById("result").textContent = "";
  document.getElementById("structured").textContent = "";
}
