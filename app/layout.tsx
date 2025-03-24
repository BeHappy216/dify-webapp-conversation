import { getLocaleOnServer } from '@/i18n/server'

import './styles/globals.css'
import './styles/markdown.scss'
import { Analytics } from '@vercel/analytics/react'; // 导入 Analytics 组件

const LocaleLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const locale = getLocaleOnServer()
  return (
    <html lang={locale ?? 'en'} className="h-full">
      <head>
        {/* 引入 CDN Web 字体 */}
        <link
          href="https://cdn.jsdelivr.net/npm/@chinese-fonts/lxgwwenkaibright@1.0.2/dist/LXGWBright-Medium/result.css"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">
        <div className="overflow-x-auto">
          <div className="w-screen h-screen min-w-[300px]">
            {children}
          </div>
        </div>
      <Analytics /> {/* 添加 Analytics 组件在这里 */}
      {/* 百度统计代码 - 使用你提供的代码 */}
      <script dangerouslySetInnerHTML={{
          __html: `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?400eac6fce29219a2b1c9dbfdf7563b1";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(hm, s);
            })();
          `,
        }} />
      </body>
    </html>
  )
}

export default LocaleLayout
