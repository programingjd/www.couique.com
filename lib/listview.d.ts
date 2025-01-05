// https://github.com/programingjd/listview
/// <reference lib="dom" />
/// <reference lib="esnext" />
export interface ListModel {
  count: number|(()=>number);
  createPlaceholderRow(): HTMLElement;
  render(placeholderRow: HTMLElement, index: number): void;
}
export class ListView extends HTMLElement {
  constructor();
  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(attributeName: string, oldValue: string): void;
  static get observedAttributes(): string[];
  set model(model: ListModel);
  get position(): number;
  set position(index: number);
  invalidate(): void
}
export default ListView;
