import { Button } from '@blueprintjs/core'
import { useTranslation } from 'react-i18next'
import { FC } from 'react'
import { Link } from 'react-router-dom'

export const OperationEditorLauncher: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Link to="/create" className="!no-underline">
        <Button large fill icon="open-application">
          {t('components.editor.OperationEditorLauncher.launch_job_editor')}
        </Button>
      </Link>
    </>
  )
}
