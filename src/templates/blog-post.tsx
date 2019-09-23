import { navigate, graphql } from 'gatsby';
import { Box, Button, Heading, Image, Text } from 'grommet';
import {
  Next as NextIcon,
  Previous as PreviousIcon,
  Revert,
  FormAdd,
  FormSubtract,
} from 'grommet-icons';
import * as React from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import Helmet from 'react-helmet';
import css from './blog-post.module.css';

import Layout from '../components/Layout';

interface BlogPostProps {
  data: {
    markdownRemark: {
      excerpt: string;
      frontmatter: {
        title: string;
        cover?: {
          childImageSharp: { fluid: { src: string } };
        };
        date?: string;
      };
      html: string;
    };
    site: {
      siteMetadata: {
        title: string;
      };
    };
  };
  pageContext: {
    previous: any;
    next: any;
    metrics: any;
    ride: any;
  };
}

const startPos = {
  center: [35.63980929926249, -105.9149725],
  zoom: 12,
};

class blogPost extends React.Component {
  state = { viewport: startPos };
  _mapRef = Map;

  _onClickReset = () => {
    // Reset to position provided in props
    this.setState({ viewport: startPos });
  };

  // _onViewportChanged = (viewport) => {
  //   console.log('viewport: ', viewport);
  //   this.state.viewport = viewport;
  // };

  _onZoomIn = () => {
    this._mapRef.leafletElement.zoomIn();
  };

  _onZoomOut = () => {
    this._mapRef.leafletElement.zoomOut();
  };

  render() {
    const {
      data,
      pageContext: { previous, next, metrics, ride },
    } = this.props;

    const post = data.markdownRemark;
    const siteTitle = data.site.siteMetadata.title;
    const siteDescription = post.excerpt;

    const { bounds, elevationGain, tripLength, rideTimeHours } = metrics;
    console.log(this.state.viewport);

    return (
      <Layout>
        <div>
          <article>
            <Box round="small" margin="small">
              <Helmet
                htmlAttributes={{ lang: 'en' }}
                meta={[{ name: 'description', content: siteDescription }]}
                title={post.frontmatter.title + '|' + siteTitle}
              />
              <div>
                <header>
                  {post.frontmatter.cover ? (
                    <Box round={{ size: 'small' }} overflow="hidden">
                      <Box basis="medium" fill={true}>
                        <Image
                          fit="cover"
                          title={post.frontmatter.title}
                          alt={post.frontmatter.title}
                          src={post.frontmatter.cover.childImageSharp.fluid.src}
                        />
                      </Box>
                    </Box>
                  ) : (
                    ''
                  )}
                  <Box pad={{ horizontal: 'medium' }}>
                    <Heading
                      margin={{ top: 'large', bottom: 'small' }}
                      level="1"
                    >
                      {post.frontmatter.title}
                    </Heading>
                    <Text margin={{ bottom: 'small' }}>
                      {post.frontmatter.date}
                    </Text>
                  </Box>
                </header>
              </div>
              <Box pad={{ horizontal: 'medium' }}>
                <div className={css.mapContainer}>
                  {window && (
                    <Map
                      ref={(node) => (this._mapRef = node)}
                      className={css.leafletTopContainer}
                      maxZoom={19}
                      bounds={bounds}
                      scrollWheelZoom={false}
                      boundsOptions={{ padding: [10, 10] }}
                      zoomControl={false}
                      animate
                      // onClick={this._onClickReset}
                      // onViewportChanged={this._onViewportChanged}
                      // viewport={this.state.viewport}
                      center={this.state.viewport.center}
                      zoom={this.state.viewport.zoom}
                    >
                      >
                      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                      {/*<TileLayer url="https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />*/}
                      {/*<TileLayer url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />*/}
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                        opacity={1.0}
                      />
                      {<GeoJSON data={ride} />}
                    </Map>
                  )}

                  <div className={css.resetMapButton}>
                    <Button
                      icon={<Revert color="white" />}
                      color="white"
                      fill
                      onClick={this._onClickReset}
                      plain={false}
                    />
                  </div>

                  <div className={css.zoomIn}>
                    <Button
                      icon={<FormAdd color="white" />}
                      color="white"
                      fill
                      onClick={this._onZoomIn}
                      plain={false}
                    />
                  </div>
                  <div className={css.zoomOut}>
                    <Button
                      icon={<FormSubtract color="white" />}
                      color="white"
                      fill
                      onClick={this._onZoomOut}
                      plain={false}
                    />
                  </div>
                </div>
              </Box>
              <Box pad={{ horizontal: 'medium' }}>
                <h2>Stats</h2>
                <div>{`Total Distance: ${tripLength} miles`}</div>
                <div>{`Elevation Gain: ${elevationGain} ft`}</div>
                <div>{`Ride Time: ${rideTimeHours.lowerBound}-${rideTimeHours.upperBound} hours`}</div>
              </Box>
              <Box pad={{ horizontal: 'medium' }}>
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
              </Box>
            </Box>
          </article>
          <aside>
            <Box direction="row" justify="center" gap="large" margin="large">
              {previous && (
                <Button
                  onClick={() => navigate(previous.fields.slug)}
                  icon={<PreviousIcon />}
                  label="Previous"
                  hoverIndicator
                />
              )}

              {next && (
                <Button
                  onClick={() => navigate(next.fields.slug)}
                  icon={<NextIcon />}
                  label="Next"
                  reverse={true}
                  hoverIndicator
                />
              )}
            </Box>
          </aside>
        </div>
      </Layout>
    );
  }
}

export default blogPost;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        cover {
          childImageSharp {
            fluid(maxWidth: 1024) {
              src
            }
          }
        }
      }
    }
  }
`;
