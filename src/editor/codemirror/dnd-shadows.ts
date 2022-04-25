import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

export const makeShadow = 
 (view: EditorView, state: EditorState,
  isPreview: Boolean, isDrop:Boolean, 
  underlayLayer: HTMLElement, 
  from: number, to:number) => {
  
  let previewRemoved = false

  Array.from(underlayLayer.children).forEach(child => {
    if (isPreview){
      if(child.classList.contains("cm-dnd-boxshadow--up")){
        underlayLayer.removeChild(child);
        previewRemoved = true
      }
    } else {
      //should be a drop
      if(child.classList.contains("cm-dnd-boxshadow--up")){
        child.classList.add("cm-dnd-boxshadow--transition")
        //remove shadow
        child.classList.remove("cm-dnd-boxshadow--up")
        //delete it after the animation
        setTimeout(() => {
          underlayLayer.removeChild(child);
        } , 500);
      }
    }
  }); 
  

  if (isPreview) {
    let startline = state.doc.lineAt(from).number
    // to is the start of the next line so we take 1
    let endline = state.doc.lineAt(to).number - 1

    //remove leading and trailing whitespace
    //the changes often add blank lines, this ignores them
    let line = state.doc.line(startline)
    while (startline < endline && !line.text.trim()) {
      startline = startline + 1
      line = state.doc.line(startline)
    }
    line = state.doc.line(endline)
    while (endline > startline && !line.text.trim()) {
      endline = endline - 1
      line = state.doc.line(endline)
    }


    let top = view.defaultLineHeight * (startline - 1)
    let height = view.defaultLineHeight * (endline + 1 - startline)
    

    //calculate indent
    let startlinetext = state.doc.line(startline).text
    let numOfIndents = 0
    const tabSize = 4
    while (true) {
      if (startlinetext.startsWith(" ".repeat(tabSize))){
        startlinetext = startlinetext.slice(tabSize)
      } else if (startlinetext.startsWith("\t")){
        startlinetext = startlinetext.slice(1)
      } else break
      numOfIndents += 1
    }
    console.log("numINd", numOfIndents)

    let blockIndent = numOfIndents * tabSize * view.defaultCharacterWidth 

    let box = document.createElement("div") 
    box.classList.add("cm-dnd-shadow","cm-dnd-boxshadow")
    box.style.left = blockIndent + 19 + "px"
    box.style.top = top + "px"
    box.style.height = height + "px"

    let handleShadow = document.createElement("div") 
    handleShadow.classList.add("cm-dnd-shadow","cm-dnd-handleshadow")
    handleShadow.style.top = top + "px"
    handleShadow.style.height = view.defaultLineHeight + "px"
    handleShadow.style.left = blockIndent + "px"

    if(previewRemoved) {
      handleShadow.classList.add("cm-dnd-boxshadow--up")
      box.classList.add("cm-dnd-boxshadow--up")
    } else {
      handleShadow.classList.add("cm-dnd-boxshadow--transition")
      box.classList.add("cm-dnd-boxshadow--transiton")
      setTimeout(() => {
        handleShadow.classList.add("cm-dnd-boxshadow--up")
        box.classList.add("cm-dnd-boxshadow--up")
      } , 1);
    }

    underlayLayer.appendChild(box)
    underlayLayer.appendChild(handleShadow)
  }
}

export const dndShadowsTheme = EditorView.theme({
  ".cm-dnd-shadow": {
    position: "absolute",
    borderRadius: "0 5px 5px 5px",
    backgroundColor: "var(--chakra-colors-gray-10)"
  },
  ".cm-dnd-boxshadow": {
    width: "100%",
  },
  ".cm-dnd-handleshadow":{
    width: "1.2rem",
    zIndex: "-6"
  },
  ".cm-dnd-boxshadow--transition": {
    transition: "all 0.4s cubic-bezier(.25,.8,.25,1)",
  },
  ".cm-dnd-boxshadow--up": {
    boxShadow: "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)"
  }
})