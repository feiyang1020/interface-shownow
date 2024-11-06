const followEntitySchema = {
  name: 'follow',
  nodeName: 'follow',
  path: '/follow',
  versions: [
    {
      version: 1,
      body: [
        {
          name: 'metaid',
          type: 'string',
        },
      ],
    },
  ],
}

export default followEntitySchema
