
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 66f7ab72b36d4b2a9b51e06f002de5e3");

 // const Clarifai = require('clarifai');
 // console.log(Clarifai)


const handleApiCall = (req, res) => {

stub.PostModelOutputs(
    {
        // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
        model_id: "e466caa0619f444ab97497640cefc4dc",
        inputs: [{data: {image: {url: req.body.input}}}]
    },
    metadata,
    (err, response) => {
        if (err) {
            console.log("Error: " + err);
            return;
        }

        if (response.status.code !== 10000) {
            console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
            return;
        }

        console.log("Predicted concepts, with confidence values:")
        for (const c of response.outputs[0].data.concepts) {
            console.log(c.name + ": " + c.value);
        }
        res.json(response);
    }
);

// older version it wasnt work properly

// // You must add your own API key here from Clarifai.
// const app = new Clarifai.App({
//   apiKey: '66f7ab72b36d4b2a9b51e06f002de5e3'
// });

//   app.models
//     .predict('face-detection', req.body.input)
//     .then(data => {
//       const faceData = extractFaceData(data);
//       res.json(faceData);
//     })
//     .catch(err => res.status(400).json('unable to work with API'));
 };

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(1);
    })
    .catch(err => res.status(400).json('unable to get entries'));
};

// Extracts the face coordinates from the Clarifai API response
const extractFaceData = data => {
  const clarifaiFaces = data.outputs[0]?.data?.regions || [];
  const faceData = clarifaiFaces.map(region => {
    const boundingBox = region?.region_info?.bounding_box;
    if (boundingBox) {
      const imageWidth = data.outputs[0]?.data?.metadata?.input?.width;
      const imageHeight = data.outputs[0]?.data?.metadata?.input?.height;
      return {
        leftCol: boundingBox.left_col * imageWidth,
        topRow: boundingBox.top_row * imageHeight,
        rightCol: boundingBox.right_col * imageWidth,
        bottomRow: boundingBox.bottom_row * imageHeight
      };
    }
  });
  return faceData.filter(Boolean);
};

module.exports = {
  handleImage,
  handleApiCall
};
