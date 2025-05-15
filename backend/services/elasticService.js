const elasticClient = require("../database/elasticConnection");

const INDEX_NAME = "products";

exports.createIndexIfNotExists = async () => {
  const exists = await elasticClient.indices.exists({ index: INDEX_NAME });
  if (!exists) {
    await elasticClient.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            nameProduct: { type: "text" },
            shortDescription: { type: "text" },
            brand: { type: "text" },
            category: { type: "keyword" },
            tags: { type: "text" },
            price: { type: "float" },
            createdAt: { type: "date" },
            image: { type: "text" },
          },
        },
      },
    });
  }
};

exports.indexProduct = async (product) => {
  try {
    await elasticClient.index({
      index: INDEX_NAME,
      id: product._id.toString(),
      document: {
        nameProduct: product.nameProduct,
        shortDescription: product.shortDescription,
        brand: product.brand,
        category: product.category,
        tags: product.tags,
        price: product.price,
        createdAt: product.createdAt,
        image: product.images[0],
      },
    });
  } catch (err) {
    throw new Error("Error indexing product: " + err);
  }
};

exports.deleteProductFromIndex = async (productId) => {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: productId.toString(),
    });
  } catch (err) {
    console.error("Error deleting product from index:", err);
  }
};

exports.searchProducts = async (esQuery, page, limit, sortBy, sortOrder) => {
  const from = (page - 1) * limit;

  const response = await elasticClient.search({
    index: INDEX_NAME,
    from,
    size: limit,
    body: {
      query: esQuery,
      sort: [
        {
          [sortBy]: {
            order: sortOrder,
          },
        },
      ],
    },
  });

  return response.hits.hits.map((hit) => ({ id: hit._id, ...hit._source }));
};
