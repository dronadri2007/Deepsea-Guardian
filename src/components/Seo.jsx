// React 19 hoists <title>/<meta> rendered anywhere into <head>. No helmet needed.
export default function Seo({ title, description }) {
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
    </>
  )
}
