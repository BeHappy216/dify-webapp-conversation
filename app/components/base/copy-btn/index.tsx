'use client'
import { useState } from 'react'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import { Clipboard, ClipboardCheck } from '@/app/components/base/icons/line/files'
import Toast from '@/app/components/base/toast'
import ActionButton from '@/app/components/base/action-button'

type CopyBtnProps = {
  value: string
  className?: string
}

const CopyBtn = ({ value, className }: CopyBtnProps) => {
  const { t } = useTranslation()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    copy(value)
    Toast.notify({ type: 'success', message: t('common.actionMsg.copySuccessfully') })
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1000)
  }

  return (
    <ActionButton
      className={className}
      onClick={handleCopy}
    >
      {isCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
    </ActionButton>
  )
}

export default CopyBtn