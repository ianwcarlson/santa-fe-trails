const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const blogPostTemplate = path.resolve('./src/templates/blog-post.tsx');

  const allMarkdownRemark = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `,
  );
  const rideMetricsql = await graphql(
    `
      {
        allRideMetrics {
          nodes {
            id
            internal {
              content
            }
          }
        }
      }
    `,
  );

  // <== Previous and Next ==> posts functions
  function postsIndexPrevious(posts, index) {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    return previous;
  }
  function postsIndexNext(posts, index) {
    const next = index === 0 ? null : posts[index - 1].node;
    return next;
  }
  function createPagesFun(graphql, template, rideMetricsql) {
    const posts = graphql.data.allMarkdownRemark.edges;
    const nodes =
      (rideMetricsql.data && rideMetricsql.data.allRideMetrics.nodes) || [];

    posts.forEach((post, index) => {
      const { slug } = post.node.fields;

      const foundRide = nodes.find((n) => n.id.includes(`${slug}ride`));
      const foundMetrics = nodes.find((n) => n.id.includes(`${slug}metrics`));
      const ride = JSON.parse(foundRide.internal.content);
      const metrics = JSON.parse(foundMetrics.internal.content);

      createPage({
        path: slug,
        component: template,
        context: {
          slug: post.node.fields.slug,
          previous: postsIndexPrevious(posts, index),
          next: postsIndexNext(posts, index),
          metrics,
          ride,
        },
      });
    });
  }
  await createPagesFun(allMarkdownRemark, blogPostTemplate, rideMetricsql);
};

exports.onCreateNode = async ({ node, actions, getNode }) => {
  const { createNodeField, createNode } = actions;

  if (node.extension === 'json') {
    const jsonData = require(node.absolutePath);
    console.log('YO!!!: ', node);
    await createNode({
      id: `/${node.relativePath}`,
      parent: null,
      internal: {
        mediaType: 'application/json',
        type: 'rideMetrics',
        content: JSON.stringify(jsonData),
        contentDigest: JSON.stringify(jsonData),
      },
    });
  }

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
