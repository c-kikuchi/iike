//based on https://github.com/annotorious/annotorious-v2-plugins/tree/main/plugins/annotorious-shape-labels

function htmlSanitize(text){
  return text.replace(/</g, "&lt;").replace(/>/g, "&lt;").replace(/&/g, "&amp;");
}

function IIFormatterBuilder(bridge){
  return function(annotation){
    const annot = annotation.underlying;
    //console.log("formatter |", annotation)
    const is_ocrtext = annot["_type"]=="ocrtext";
    const is_memo = annot["_type"]=="memo";
    let tag_value = "";
    const has_tag = !is_ocrtext && annotation.bodies.find(
        body=>body.purpose=="tagging"&&(tag_value=body.value)&&true
      )||(!!annot && annot["_type"]=="tagging");
    //const has_describing = annotation.bodies.some(body=>body.purpose("describing")) || annot["_type"]=="describing";

    if(is_ocrtext){
      return {
        className:"ii-annotation-ocrtext",
        style:"stroke: #B0C5A4"
      };
    }
    else if(is_memo){
      const values = annotation.bodies.filter(body=>(body.purpose=="commenting"||body.purpose=="replying"||!body.purpose)).map(body=>body.value);
      const title = values.join("\n");
      const title_elm = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title_elm.textContent = title;
      return {
        element:title_elm,
        className:"ii-annotation-memo",
        style:"stroke: #8403a9"//#0fa842"
      }
    }
    else if(has_tag){
      const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      foreignObject.setAttribute('width', '100px');
      foreignObject.setAttribute('height', '1px');

      foreignObject.innerHTML = `
      <div xmlns="http://www.w3.org/1999/xhtml" class="a9s-shape-label-wrapper">
        <div class="a9s-shape-label">
          ${htmlSanitize(tag_value)}
        </div>
      </div>
      `;

      return {
        element:foreignObject,
        className: "ii-annotation-tagging",
        style:"stroke: blue"
      }
    }
    else{
      return {
        className: "ii-annotation-box",
        style:"stroke: red"
      }
    }

  }
}

export default IIFormatterBuilder;