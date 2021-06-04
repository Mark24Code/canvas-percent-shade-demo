export const transToHttps = (url) => {
  const httpPattern = /^http:\/\/(.*)$/;
  if (httpPattern.test(url)) {
    const [protocol, sourcePath] = url.split('://')

    return `https://${sourcePath}`
  }

  return url
}