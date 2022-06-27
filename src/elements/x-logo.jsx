customElements.define('x-logo', class extends HTMLElement {
  constructor() {
    super()
    this.append(
      <div>Hello world</div>
    )
  }
})
