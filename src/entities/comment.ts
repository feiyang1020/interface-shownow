const commentEntitySchema = {
  name: 'comment',
  nodeName: 'paycomment',
  path: '/protocols/paycomment',
  versions: [
    {
      version: 1,
      body: [
        {
          name: 'content',
          type: 'string',
        },
        {
          name: 'contentType',
          type: 'string',
        },
        {
          name: 'commentTo',
          type: 'string',
        },
      ],
    },
  ],
}

export default commentEntitySchema
