window.render = (target, children) => {
  target.innerHTML = ''
  if (Array.isArray(children)) {
    target.append(...children)
  } else {
    target.append(children)
  }
}
