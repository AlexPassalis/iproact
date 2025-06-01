'use client'

import type { typeHistory, typeInputValue } from '@/lib/postgres/data/type'

import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { useForm } from '@mantine/form'
import { Group, Radio, NumberInput, Button } from '@mantine/core'
import { zodInputValue } from '@/lib/postgres/data/zod'
import axios from 'axios'
import { useState } from 'react'

type HomeClientProps = {
  postgres_history: typeHistory
}

export function HomeClient({ postgres_history }: HomeClientProps) {
  const [history, setHistory] = useState(postgres_history)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      input: 'Recent activity' as typeInputValue,
    },
    validate: zodResolver(
      z.object({
        input: zodInputValue,
      }),
    ),
  })

  return (
    <main className="text-lg h-screen w-screen flex flex-col justify-center items-center">
      <form
        onSubmit={form.onSubmit(async (values) => {
          try {
            setLoading(true)
            const res = await axios.post('http://localhost:3000/api/submit', {
              input: values.input,
              form_submission: history.length + 1,
            })
            const output = res.data.output as number
            if (output === 0) {
              alert('No more rows left')
            } else {
              setHistory((prev) => [
                {
                  form_submission: history.length + 1,
                  input: values.input,
                  output: output,
                },
                ...prev,
              ])
            }
          } catch (error) {
            console.error(error)
            alert('There was an error. Have a look at the browser logs (F12).')
          } finally {
            setLoading(false)
          }
        })}
        className="my-10 p-2 border border-[var(--mantine-border)] rounded-lg"
      >
        <NumberInput
          label="Last output"
          value={history[0]?.output ?? ''}
          size="xl"
          classNames={{
            label: '!w-full !text-center',
            input: '!text-center',
          }}
          hideControls
        />

        <Radio.Group
          name="input"
          value={form.values.input}
          onChange={(value) =>
            form.setFieldValue('input', value as typeInputValue)
          }
          error={form.errors.input}
          my="md"
        >
          <Group gap="md">
            <Radio size="md" value="Recent activity" label="Recent activity" />
            <Radio
              size="md"
              value="No recent activity"
              label="No recent activity"
            />
          </Group>
        </Radio.Group>

        <Button
          type="submit"
          disabled={loading}
          size="md"
          radius="md"
          style={{ width: '100%' }}
        >
          Submit
        </Button>
      </form>

      <div className="flex">
        <div className="mr-10 border border-black rounded-lg max-h-72 overflow-y-auto">
          <h1 className="py-1 text-xl w-full text-center border-b border-black">
            History
          </h1>
          <div className="flex">
            <div className="flex flex-col items-center">
              <h2 className="w-full text-center px-2 border-b border-black">
                form_submission
              </h2>
              {history.map((item, index, array) => (
                <p
                  key={index}
                  className={`px-2 py-1 w-full text-center ${
                    index < 5 || index !== array.length - 1
                      ? 'border-b border-black'
                      : ''
                  }`}
                >
                  {item.form_submission}
                </p>
              ))}
            </div>
            <div className="flex flex-col items-center border-x border-black">
              <h2 className="w-full text-center px-2 border-b border-black">
                input
              </h2>
              {history.map((item, index, array) => (
                <p
                  key={index}
                  className={`px-2 py-1 w-full text-center ${
                    index < 5 || index !== array.length - 1
                      ? 'border-b border-black'
                      : ''
                  }`}
                >
                  {item.input}
                </p>
              ))}
            </div>
            <div className="flex flex-col items-center">
              <h2 className="w-full text-center px-2 border-r border-b border-black">
                output
              </h2>
              {history.map((item, index, array) => (
                <p
                  key={index}
                  className={`px-2 py-1 w-full text-center border-r ${
                    index < 5 || index !== array.length - 1
                      ? 'border-b border-black'
                      : ''
                  }`}
                >
                  {item.output}
                </p>
              ))}
            </div>

            {history.length > 0 && (
              <Button
                onClick={async () => {
                  try {
                    setLoading(true)
                    await axios.delete('http://localhost:3000/api/undo')
                    setHistory((prev) => prev.slice(1))
                  } catch (error) {
                    console.error(error)
                    alert(
                      'There was an error. Have a look at the browser logs (F12).',
                    )
                  } finally {
                    setLoading(false)
                  }
                }}
                type="button"
                color="red"
                disabled={loading}
                size="compact-sm"
                radius="sm"
                className="mt-[35.5px] mx-2"
              >
                undo
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 p-2 border border-black rounded-lg">
          <NumberInput
            label="Form submissions"
            value={history.length}
            size="md"
            hideControls
          />
          <NumberInput
            label="Recent activity"
            value={
              history.filter((item) => item.input === 'Recent activity').length
            }
            size="md"
            hideControls
          />
          <NumberInput
            label="No recent activity"
            value={
              history.filter((item) => item.input === 'No recent activity')
                .length
            }
            size="md"
            hideControls
          />
        </div>
      </div>
    </main>
  )
}
