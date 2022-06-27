import worldUrl from '../world.svg'
import './app-map.css'

customElements.define(
  'app-map',
  class OneMap extends HTMLElement {
    connectedCallback() {
      this.styleElement = <style />
      this.tooltipElement = <div class="app-map-tooltip" />
      this.renderSvg()
      this.addEventListener('mousemove', this.onMouseMove.bind(this))
    }

    onMouseMove(event) {
      const country = this.contains(event.target) &&
        (
          event.target.getAttribute('name') ||
          event.target.getAttribute('class')
        )

      if (country) {
        this.selectCountry(country)
        this.showTooltip({
          x: event.clientX,
          y: event.clientY,
          text: country
        })
      } else {
        this.selectCountry(null)
        this.hideTooltip()
      }
    }

    disconnectedCallback() {
      this.innerHTML = ''
    }

    renderSvg() {
      return fetch(worldUrl)
        .then(res => res.text())
        .then(svg => {
          this.innerHTML = svg
          this.append(this.styleElement)
        })
    }

    selectCountry(country) {
      if (!country) {
        this.styleElement.textContent = ''
        if (this.tooltipElement.parentNode) this.tooltipElement.remove()
        this.classList.remove('has-focus')
      } else {
        this.styleElement.textContent = `
          ${country.split(/\s+/g).map(_ => `.${_.replace(/[()]/g, _ => '\\' + _)}`).join('')}, [name="${country}"] {
            fill: #c3dafa !important;
          }
        `
        this.classList.add('has-focus')
      }
    }

    showTooltip({ x, y, text }) {
      this.tooltipElement.textContent = text
      Object.assign(this.tooltipElement.style, {
        transform: `translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(25px)`
      })
      if (!this.tooltipElement.parentNode) {
        this.append(this.tooltipElement)
      }
    }

    hideTooltip() {
      if (this.tooltipElement.parentNode) {
        this.tooltipElement.remove()
      }
    }
  },
)
