import { replaceInFile } from "replace-in-file"

const replacements = [
  {
    files: "dist/index.html",
    from: /\.\/public\/tinymce\//g,
    to: "./tinymce/",
  },
  {
    files: "dist/assets/*.js",
    from: /\.\/public\/markers/g,
    to: "./markers",
  },
]

try {
  for (const replacement of replacements) {
    const result = await replaceInFile(replacement)
    console.log("Replacement result:", result)
  }
  console.log("All replacements completed successfully.")
} catch (error) {
  console.error("Error occurred:", error)
}
