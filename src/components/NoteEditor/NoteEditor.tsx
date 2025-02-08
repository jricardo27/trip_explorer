import "tinymce/tinymce"
import "tinymce/icons/default"
import "tinymce/models/dom/model"
import "tinymce/plugins/advlist"
import "tinymce/plugins/autolink"
import "tinymce/plugins/charmap"
import "tinymce/plugins/code"
import "tinymce/plugins/fullscreen"
import "tinymce/plugins/image"
import "tinymce/plugins/link"
import "tinymce/plugins/lists"
import "tinymce/plugins/table"
import "tinymce/skins/ui/oxide/skin.min.css"
import "tinymce/themes/silver"
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react"
import React, { useState } from "react"

import styles from "./NoteEditor.module.css"

interface EditorProps {
  initialText: string
  onChange: (content: string) => void
}

const NoteEditor: React.FC<EditorProps> = ({ initialText, onChange }) => {
  const [contentEditor, setContentEditor] = useState(initialText)
  const handleEditorChange = (content) => {
    if (typeof content === "string") {
      setContentEditor(content)
      onChange(content)
    }
  }

  return (
    <div className={styles["tinymce-editor"]}>
      <TinyMCEEditor
        onChange={handleEditorChange}
        init={{
          height: 400,
          width: "100%",
          menubar: false,
          plugins: ["lists", "advlist", "fullscreen", "autolink", "charmap", "code", "image", "link", "table"],
          toolbar: [
            "undo redo | bold italic backcolor image charmap link" +
            " | advlist bullist numlist outdent indent table | code  fullscreen",
          ],
        }}
        value={contentEditor}
        onEditorChange={handleEditorChange}
        licenseKey="gpl"
      />
    </div>
  )
}

export default NoteEditor
