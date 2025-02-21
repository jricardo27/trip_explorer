import { replaceInFile } from "replace-in-file"

const replacements = [
  {
    files: "dist/assets/*.js",
    from: /"\/markers\//g,
    to: '"./markers/',
  },
  {
    files: "dist/assets/*.js",
    from: /src:"public\//g,
    to: 'src:"',
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
