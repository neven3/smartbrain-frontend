import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank';
import Particles from 'react-particles-js';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 10,
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

const initialState = {
  input: '',
  imageURL: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    email: '',
    name: '',
    id: '',
    entries: 0,
    joined: '',
  },
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        email: '',
        name: '',
        id: '',
        entries: 0,
        joined: '',
      },
    };
  }

  loadUser = (data) => {
    this.setState({user: {
      email: data.email,
      name: data.name,
      id: data.id,
      entries: data.entries,
      joined: data.joined,
    }});
  }

  calculateFaceLocation = (data) => {
    // const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
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
    if (route === 'signin') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route});
  }

  displayFacebox = box => this.setState({box});

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onSubmit = () => {
    this.setState({ imageURL: this.state.input });
    fetch('https://gentle-sea-09925.herokuapp.com/imageurl', {
        method: 'post',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          input: this.state.input,
        }),
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://gentle-sea-09925.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
          .then(response => response.json())
          .then(count => {
            this.setState({user: Object.assign(this.state.user, {entries: count})})
          })
          .catch(console.log);
        }
        this.displayFacebox(this.calculateFaceLocation(response))
      })
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
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
            <FaceRecognition imageURL={imageURL} box={box}/>
          </div>
          : route === 'register'
            ? <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
            : <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        }
      </div>
    );
  }
}

export default App;