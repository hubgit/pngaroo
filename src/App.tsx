import classnames from 'classnames'
import copy from 'clipboard-copy'
import { saveAs } from 'file-saver'
import filesize from 'filesize'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import './App.css'
import { InfoLink } from './InfoLink'
import { ServiceWorkerContext } from './ServiceWorker'
import { Snack } from './Snack'

const useDebounce = <T extends unknown>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface Size {
  width: number
  height: number
}

export const App: React.FC = () => {
  const updateCheck = useContext(ServiceWorkerContext)

  const [inputFile, setInputFile] = useState<File>()
  const [inputImage, setInputImage] = useState<HTMLImageElement>()
  const [size, setSize] = useState<Size>()
  const [filename, setFilename] = useState<string>()
  const [output, setOutput] = useState<Blob>()
  const [outputURL, setOutputURL] = useState<string>()
  const [scale, setScale] = useState<number>(100)
  const [notification, setNotification] = useState<React.ReactElement>()

  const debouncedScale = useDebounce(scale, 100)

  // reset the state
  const handleReset = useCallback(() => {
    setInputImage(undefined)
    setSize(undefined)
    setFilename(undefined)
    setOutput(undefined)
    setOutputURL(undefined)
    setScale(100)
  }, [])

  // handle dropped files
  const onDrop = useCallback((files: File[]) => {
    if (files.length) {
      const [input] = files
      setInputFile(input)
    }
  }, [])

  useEffect(() => {
    handleReset()
    updateCheck()

    if (inputFile) {
      setFilename(inputFile.name)

      const inputURL = URL.createObjectURL(inputFile)

      const image = new Image()
      image.src = inputURL
      image.addEventListener('load', () => {
        setInputImage(image)
      })

      return () => {
        URL.revokeObjectURL(inputURL)
      }
    }
  }, [handleReset, inputFile, updateCheck])

  // draw the input image to the canvas
  const inputCanvasMounted = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) {
        return
      }

      const context = canvas.getContext('2d')

      if (!context) {
        return
      }

      if (inputImage) {
        canvas.height = inputImage.naturalHeight
        canvas.width = inputImage.naturalWidth

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(inputImage, 0, 0)
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    },
    [inputImage]
  )

  // draw the output image to the canvas
  const outputCanvasMounted = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) {
        return
      }

      const context = canvas.getContext('2d')

      if (!context) {
        return
      }

      if (inputImage) {
        if (size !== undefined) {
          canvas.height = size.height
          canvas.width = size.width

          context.clearRect(0, 0, canvas.width, canvas.height)
          context.drawImage(inputImage, 0, 0, canvas.width, canvas.height)

          const outputURL = canvas.toDataURL('image/png')
          setOutputURL(outputURL)

          canvas.toBlob((output) => {
            if (output) {
              setOutput(output)
            }
          }, 'image/png')
        }
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    },
    [inputImage, size]
  )

  // handle scale changes
  const handleScale = useCallback((event) => {
    setScale(event.target.value)
  }, [])

  useEffect(() => {
    if (debouncedScale && inputImage) {
      setSize({
        width: inputImage.naturalWidth * (debouncedScale / 100),
        height: inputImage.naturalHeight * (debouncedScale / 100),
      })
    }
  }, [debouncedScale, inputImage])

  // copy the base64-encoded data URL to the clipboard
  const handleCopy = useCallback(() => {
    if (outputURL) {
      copy(outputURL)
        .then(() => {
          setNotification(
            <Snack
              message={'Copied to clipboard'}
              actions={[
                {
                  text: 'Dismiss',
                  callback: () => setNotification(undefined),
                },
              ]}
            />
          )
        })
        .catch((error) => {
          console.error(error)

          setNotification(
            <Snack
              message={'Error copying to clipboard'}
              className={'snack-error'}
              actions={[
                {
                  text: 'Dismiss',
                  callback: () => setNotification(undefined),
                },
              ]}
            />
          )
        })
    }
  }, [outputURL])

  // download the output PNG file
  const handleDownload = useCallback(() => {
    if (output) {
      saveAs(output, filename || 'download.png')
    }
  }, [filename, output])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
  })

  const handleFilenameChange = useCallback((event) => {
    setFilename(event.target.value)
  }, [])

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      event.preventDefault()

      if (event.clipboardData) {
        const { items } = event.clipboardData

        for (const item of items) {
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const input = item.getAsFile()
            if (input) {
              setInputFile(input)
            }
          }
        }
      }
    },
    []
  )

  const handleClose = useCallback(() => {
    setInputFile(undefined)
  }, [])

  const handleHalf = useCallback(() => {
    setScale((value) => Math.round(value / 2))
  }, [])

  return (
    <div
      className={classnames({
        container: true,
        fullscreen: !inputFile,
      })}
    >
      <nav className={'nav'}>
        <div className={'nav-group header-filename'}>
          <div className={'logo'} />

          {!inputFile && <span className={'brand'}>Pngaroo</span>}

          {filename && (
            <input
              type={'text'}
              className={'filename'}
              size={filename.length + 1}
              value={filename}
              onChange={handleFilenameChange}
            />
          )}
        </div>

        <div className={'nav-group header-actions'}>
          {!inputFile && (
            <InfoLink
              href={'https://github.com/hubgit/pngaroo'}
              title={'View source on GitHub'}
            />
          )}

          {inputFile && (
            <button className={'button close'} onClick={handleClose}>
              ✕
            </button>
          )}
        </div>
      </nav>

      {!inputFile && (
        <div className={'upload'}>
          <div {...getRootProps()} className={'dropzone'}>
            <input {...getInputProps()} />

            <section>
              {isDragActive ? (
                <div>Drop a PNG…</div>
              ) : (
                <div>
                  Drag a PNG
                  <br /> or click to select a file
                </div>
              )}
            </section>
          </div>

          <textarea
            className={'paste'}
            onPaste={handlePaste}
            placeholder={'or paste an image here'}
          />
        </div>
      )}

      {output && (
        <div className={'controls-container'}>
          <div className={'controls-panel'}>
            <div className={'file-meta'}>
              <div className={'file-meta-section'}>INPUT</div>

              {inputImage && (
                <div className={'file-meta-section'}>
                  🖼️
                  {inputImage.naturalWidth}
                  {' x '}
                  {inputImage.naturalHeight}px
                </div>
              )}

              {inputFile && (
                <div className={'file-meta-section'}>
                  💾
                  {filesize(inputFile.size, {
                    round: 1,
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={'controls-panel'}>
            <div className={'file-meta'}>
              <div className={'file-meta-section'}>OUTPUT</div>

              {size && (
                <div className={'file-meta-section'}>
                  🖼️
                  {Math.round(size.width)}
                  {' x '}
                  {Math.round(size.height)}px ({debouncedScale}%)
                </div>
              )}

              {output && inputFile && (
                <div className={'file-meta-section'}>
                  💾
                  {filesize(output.size, {
                    round: 1,
                  })}{' '}
                  ({Math.round((output.size / inputFile.size) * 100)}%)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {inputFile && (
        <div className={'panels'}>
          <div className={'panel'}>
            <canvas ref={inputCanvasMounted} className={'input'} />
          </div>

          <div className={'divider'} />

          <div className={'panel'}>
            <canvas ref={outputCanvasMounted} className={'output'} />
          </div>
        </div>
      )}

      {output && (
        <div className={'controls-container'}>
          <div className={'controls-panel'} />

          <div className={'controls-panel'}>
            <div>
              {output && inputFile && (
                <>
                  <div className={'output-section controls'}>
                    <label>
                      <input
                        type={'range'}
                        className={'scale-range'}
                        value={scale}
                        onChange={handleScale}
                        step={1}
                        min={0}
                        max={100}
                      />
                      <input
                        type={'number'}
                        value={scale}
                        onChange={handleScale}
                        className={'scale-input'}
                      />
                      %
                    </label>

                    <button
                      className={'button button-mini half'}
                      onClick={handleHalf}
                    >
                      ½
                    </button>
                  </div>

                  <div className={'output-section controls button-group'}>
                    {output && filename && (
                      <button
                        className={'button button-mini'}
                        onClick={handleDownload}
                      >
                        Download PNG
                      </button>
                    )}
                    {outputURL && (
                      <button
                        className={'button button-mini'}
                        onClick={handleCopy}
                      >
                        Copy Base64 URL
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {notification}
    </div>
  )
}
