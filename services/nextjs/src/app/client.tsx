'use client'

import type { typeOutput, typeInputValue } from '@/lib/postgres/data/type'

import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { useForm } from '@mantine/form'
import { Group, Radio, NumberInput, Button } from '@mantine/core'
import { zodInputValue } from '@/lib/postgres/data/zod'
import axios from 'axios'
import { useState } from 'react'

type HomeClientProps = {
  postgres_output: typeOutput
}

export function HomeClient({ postgres_output }: HomeClientProps) {
  const [outputs, setOutputs] = useState(postgres_output)
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
            const res = await axios.post('/api/submit', {
              input: values.input,
              form_submission: outputs.length + 1,
            })
            const allocation = res.data.allocation as number
            if (allocation === 0) {
              alert('No more rows left')
            } else {
              setOutputs((prev) => [
                {
                  form_submission: outputs.length + 1,
                  input: values.input,
                  allocation: allocation,
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
          label="Last allocation"
          value={outputs[0]?.allocation ?? ''}
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
            Output
          </h1>
          <div className="flex">
            <div className="flex flex-col items-center">
              <h2 className="w-full text-center px-2 border-b border-black">
                form_submission
              </h2>
              {outputs.map((item, index, array) => (
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
              {outputs.map((item, index, array) => (
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
                allocation
              </h2>
              {outputs.map((item, index, array) => (
                <p
                  key={index}
                  className={`px-2 py-1 w-full text-center border-r ${
                    index < 5 || index !== array.length - 1
                      ? 'border-b border-black'
                      : ''
                  }`}
                >
                  {item.allocation}
                </p>
              ))}
            </div>

            {outputs.length > 0 && (
              <Button
                onClick={async () => {
                  try {
                    setLoading(true)
                    await axios.delete('/api/undo')
                    setOutputs((prev) => prev.slice(1))
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
            value={outputs.length}
            size="md"
            hideControls
          />
          <NumberInput
            label="Recent activity"
            value={
              outputs.filter((item) => item.input === 'Recent activity').length
            }
            size="md"
            hideControls
          />
          <NumberInput
            label="No recent activity"
            value={
              outputs.filter((item) => item.input === 'No recent activity')
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
