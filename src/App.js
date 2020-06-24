import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank';
import Particles from 'react-particles-js';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';
import Clarifai from 'clarifai';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 500
      }
    },
    line_linked: {
      shadow: {
        enable: true,
        color: '#3CA9D1',
      }
    }
  },
};

const app = new Clarifai.App({
  apiKey: '6e58104673d1490e8d67f9da0f283cd3'
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
    };
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.querySelector('#inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      topRow: clarifaiFace.top_row * height,
      bottomRow: height - clarifaiFace.bottom_row * height,
      leftCol: clarifaiFace.left_col * width,
      rightCol: width - clarifaiFace.right_col * width,
    };
  }

  onRouteChange = route => {
    if (route === 'home') {
      this.setState({isSignedIn: true});
    } else {
      this.setState({isSignedIn: false});
    }
    this.setState({route});
  }

  displayFacebox = box => this.setState({box});

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onSubmit = () => {
    this.setState({ imageURL: this.state.input });
    app.models
      .predict(
        'c0c0ac362b03416da06ab3fa36fb58e3',
        this.state.input)
      .then(response => this.displayFacebox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err));
  }
  
  render() {
    const { imageURL, route, box, isSignedIn } = this.state;
    return(
      <div className = "App" >
        <Particles
          className='particles'
          params={particlesOptions}
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        {route === 'home'
          ? <div>
            <Logo />
            <Rank />
            <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
            <FaceRecognition imageURL={imageURL} box={box}/>
          </div>
          : route === 'register'
            ? <Register onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
            : <SignIn onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        }
      </div>
    );
  }
}

export default App;