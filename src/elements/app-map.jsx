import worldUrl from '../world.svg'
import './app-map.css'

customElements.define(
  'app-map',
  class OneMap extends HTMLElement {
    connectedCallback() {
      this.highlightStyleElement = <style />
      this.zoomStyleElement = <style />
      this.tooltipElement = <div class="app-map-tooltip" />
      this.renderSvg()
      this.addEventListener('mousemove', this.onMouseMove.bind(this))
      this.addEventListener('click', this.onClick.bind(this))
    }

    onClick(event) {
      const country =
        this.contains(event.target) &&
        (event.target.getAttribute('name') ||
          event.target.getAttribute('class'))

      if (country && !this.isZoomed) {
        this.zoomToCountry(country)
        this.isZoomed = true
        this.highlightAndLabel(null)
        this.hideTooltip()
      } else {
        this.zoomToCountry(null)
        this.isZoomed = false
      }
    }

    onMouseMove(event) {
      const country =
        this.contains(event.target) &&
        (event.target.getAttribute('name') ||
          event.target.getAttribute('class'))

      if (country && !this.isZoomed) {
        this.highlightAndLabel(country)
        this.showTooltip({
          x: event.clientX,
          y: event.clientY,
          text: country,
        })
      } else {
        this.highlightAndLabel(null)
        this.hideTooltip()
      }
    }

    disconnectedCallback() {
      this.innerHTML = ''
    }

    renderSvg() {
      return fetch(worldUrl)
        .then(res => res.text())
        .then(svgText => {
          this.innerHTML = svgText
          this.append(this.highlightStyleElement, this.zoomStyleElement)
          this.svg = this.querySelector('svg')
          this.svg.style.transition = 'transform 1s'
          this.svg.style.transformOrigin = '0 0'
        })
    }

    highlightAndLabel(country) {
      if (!country) {
        this.highlightStyleElement.textContent = ''
        if (this.tooltipElement.parentNode) this.tooltipElement.remove()
        this.classList.remove('has-focus')
      } else {
        this.highlightStyleElement.textContent = `
          ${country
            .split(/\s+/g)
            .map(_ => `.${_.replace(/[()]/g, _ => '\\' + _)}`)
            .join('')}, [name="${country}"] {
            fill: #c3dafa !important;
          }
        `
        this.classList.add('has-focus')
      }
    }

    zoomToCountry(country) {
      if (!country) {
        this.zoomStyleElement.textContent = ''
      } else {
        const bounds = this.getCountryBounds(country)
        const scale = Math.min(
          this.clientWidth / bounds.width,
          this.clientHeight / bounds.height,
        )
        let x = -bounds.x * scale
        let y = -bounds.y * scale

        const { clientWidth, clientHeight } = this

        this.zoomStyleElement.textContent = `
          svg path {
            fill: #304869 !important;
            position: relative;
            z-index: 1 !important;
          }
          ${country
            .split(/\s+/g)
            .map(_ => `.${_.replace(/[()]/g, _ => '\\' + _)}`)
            .join('')}, [name="${country}"] {
            fill: #c3dafa !important;
            stroke: #2e86ff !important;
            stroke-width: 1 !important;
            z-index: 10 !important;
            position: relative !important;
          }
          svg {
            transform:
              translateX(${x}px)
              translateY(${y}px)
              translateX(${clientWidth / 2}px)
              translateX(${(-bounds.width / 2) * scale}px)
              translateY(${clientHeight / 2}px)
              translateY(${(-bounds.height / 2) * scale}px)
              scale(${scale})
            ;
          }
        `
      }
    }

    /**
     * Gets the outer bounds for all elements of the country in the SVG.
     */
    getCountryBounds(country) {
      const countryElements = this.querySelectorAll(
        country
          .split(/\s+/g)
          .map(_ => `.${_.replace(/[()]/g, _ => '\\' + _)}`)
          .concat('[name="' + country + '"]')
          .join(','),
      )
      const bounds = {
        x0: null,
        y0: null,
        x1: null,
        y1: null,
      }

      for (let i = 0; i < countryElements.length; i++) {
        const element = countryElements[i]
        const { top, left, width, height } = element.getBoundingClientRect()

        if (bounds.x0 === null || left < bounds.x0) bounds.x0 = left
        if (bounds.y0 === null || top < bounds.y0) bounds.y0 = top
        if (bounds.x1 === null || left + width > bounds.x1)
          bounds.x1 = left + width
        if (bounds.y1 === null || top + height > bounds.y1)
          bounds.y1 = top + height
      }

      bounds.width = bounds.x1 - bounds.x0
      bounds.height = bounds.y1 - bounds.y0
      bounds.x = bounds.x0
      bounds.y = bounds.y0

      return bounds
    }

    showTooltip({ x, y, text }) {
      this.tooltipElement.textContent = text
      Object.assign(this.tooltipElement.style, {
        transform: `translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(25px)`,
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
