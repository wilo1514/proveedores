import{r as s,j as l}from"./index-m6YQFuOa.js";import{c as x}from"./createLucideIcon-CDU9dQKs.js";const d=({value:r,onChange:n,unit:p,disabled:a})=>{const[c,o]=s.useState(r);s.useEffect(()=>{o(r)},[r]);const i=t=>{let e=t.target.value;p==="UN"?(e=e.replace(/[^\d]/g,""),e=e.replace(/^0+/,""),e===""&&(e="0"),parseInt(e,10)>35e3&&(e="0"),o(e),n(e)):p==="KG"&&(e=e.replace(/[^\d.]/g,""),e=e.replace(/^0+/,""),e=e.replace(",","."),e===""&&(e="0"),parseFloat(e)>15e3&&(e="0"),o(e),n(e))};return l.jsx("input",{type:"text",value:c,onChange:i,disabled:a,style:{width:"70px",padding:"3px",borderRadius:"4px",border:"1px solid gray",textAlign:"center",cursor:a?"not-allowed":"pointer",opacity:a?.3:1},onDrop:t=>t.preventDefault(),onPaste:t=>t.preventDefault(),onCopy:t=>t.preventDefault()})};/**
 * @license lucide-react v0.483.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["line",{x1:"12",x2:"12",y1:"20",y2:"10",key:"1vz5eb"}],["line",{x1:"18",x2:"18",y1:"20",y2:"4",key:"cun8e5"}],["line",{x1:"6",x2:"6",y1:"20",y2:"16",key:"hq0ia6"}]],m=x("ChartNoAxesColumnIncreasing",u);export{d as C,m as a};
