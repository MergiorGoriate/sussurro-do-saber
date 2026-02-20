import{c as r,n as a}from"./main-8XSaGCev.js";/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],n=r("circle-check",o);/**
 * @license lucide-react v0.555.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],s=r("info",t),l={getPublications:async e=>(await a.get("/library/publications/",{params:e})).data,getPublication:async e=>(await a.get(`/library/publications/${e}/`)).data,recordView:async e=>await a.post(`/library/publications/${e}/view/`,{}),recordDownload:async e=>(await a.post(`/library/publications/${e}/download/`,{})).data};export{n as C,s as I,l};
