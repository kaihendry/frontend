// https://cloudinary.com/documentation/image_transformations#automatic_format_selection
const defaultTransform = 'f_auto'

const generalReplacer = (url, paramsStr) => url.replace(/\/upload\/[^/]*\//,
  `/upload/${defaultTransform + (paramsStr ? ',' + paramsStr : '')}/`)

export const matchWidth = (url, pixelWidth) => generalReplacer(url, `w_${pixelWidth}`)
export const fitDimensions = (url, pixelWidth, pixelHeight) =>
  generalReplacer(url, `w_${pixelWidth},h_${pixelHeight},c_fill`)
