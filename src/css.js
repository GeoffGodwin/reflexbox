import sheet from './sheet'

const css = config => props => {
  const next = {}
  const classNames = []

  const breaks = [ null, ...config.breakpoints ]
  const sx = stylers(config)

  for (let key in props) {
    const val = props[key]
    if (!REG.test(key)) {
      next[key] = val
      continue
    }
    const cx = createRule(breaks, sx)(key, val)
    cx.forEach(cn => classNames.push(cn))
  }

  next.className = join(next.className, ...classNames)

  return next
}

const REG = /^([wmp][trblxy]?|flex|wrap|column|align|justify)$/
const cache = {}

const createRule = (breaks, sx) => (key, val) => {
  const classNames = []
  const id = '_Rfx' + sheet.cssRules.length.toString(36)
  const k = key.charAt(0)
  const style = sx[key] || sx[k]

  const rules = toArr(val).map((v, i) => {
    const bp = breaks[i]
    const decs = style(key, v)
    const cn = id + '_' + (bp || '')
    const body = `.${cn}{${decs}}`
    const rule = media(bp, body)

    if (cache[cn]) {
      classNames.push(cache[cn])
      return null
    } else {
      classNames.push(cn)
      cache[cn] = cn
      return rule
    }
  }).filter(r => r !== null)

  sheet.insert(rules)

  return classNames
}

const toArr = n => Array.isArray(n) ? n : [ n ]
const num = n => typeof n === 'number' && !isNaN(n)

const join = (...args) => args
  .filter(a => !!a)
  .join(' ')

const dec = args => args.join(':')
const rule = args => args.join(';')
const media = (bp, body) => bp ? `@media screen and (min-width:${bp}em){${body}}` : body

const width = (key, n) => dec([ 'width', !num(n) || n > 1 ? n : (n * 100) + '%' ])

const space = scale => (key, n) => {
  const [ a, b ] = key.split('')
  const prop = a === 'm' ? 'margin' : 'padding'
  const dirs = directions[b] || ['']
  const neg = n < 0 ? -1 : 1
  const val = !num(n) ? n : (scale[n] || n) * neg + 'px'
  return rule(dirs.map(d => dec([ prop + d, val ])))
}

const directions = {
  t: [ '-top' ],
  r: [ '-right' ],
  b: [ '-bottom' ],
  l: [ '-left' ],
  x: [ '-left', '-right' ],
  y: [ '-top', '-bottom' ],
}

const flex = (key, n) => dec([ 'display', 'flex' ])
const wrap = (key, n) => dec([ 'flex-wrap', 'wrap' ])
const column = (key, n) => dec([ 'flex-direction', 'column' ])
const align = (key, n) => dec([ 'align-items', n ])
const justify = (key, n) => dec([ 'justify-content', n ])
const order = (key, n) => dec([ 'order', n ])

const stylers = config => ({
  w: width,
  m: space(config.space),
  p: space(config.space),
  flex,
  wrap,
  column,
  align,
  justify,
  order
})

export default css
