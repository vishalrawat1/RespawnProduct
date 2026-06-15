const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://admin:admin@cluster0.4oylpn6.mongodb.net/?appName=Cluster0";

async function updateImages() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("test");
    const productsCollection = db.collection("products");

    // Update Puma RS-Z
    await productsCollection.updateOne(
      { id: "puma-rs-z" },
      {
        $set: {
          manufacturer_reference_images: {
            front_view: "returnassessment/temp_test_images/puma-rs-z/m1.webp",
            back_view: "returnassessment/temp_test_images/puma-rs-z/m2.webp",
            detail_view: "returnassessment/temp_test_images/puma-rs-z/m3.webp"
          }
        }
      }
    );

    // Update Echo Dot
    await productsCollection.updateOne(
      { id: "echo-dot-5" },
      {
        $set: {
          manufacturer_reference_images: {
            front_view: "returnassessment/temp_test_images/echo-dot-5/m1.jpg",
            back_view: "returnassessment/temp_test_images/echo-dot-5/m2.jpg",
            detail_view: "returnassessment/temp_test_images/echo-dot-5/m3.jpg"
          }
        }
      }
    );

    // Update iPhone 15 Pro
    await productsCollection.updateOne(
      { id: "iphone-15-pro" },
      {
        $set: {
          manufacturer_reference_images: {
            front_view: "returnassessment/temp_test_images/iphone-15-pro/m1.jpg",
            back_view: "returnassessment/temp_test_images/iphone-15-pro/m2.jpg",
            detail_view: "returnassessment/temp_test_images/iphone-15-pro/m3.jpg"
          }
        }
      }
    );

    console.log("Successfully linked manufacturer photos to products in Cloud MongoDB!");
  } catch (err) {
    console.error("Error updating DB:", err);
  } finally {
    await client.close();
  }
}

updateImages();
