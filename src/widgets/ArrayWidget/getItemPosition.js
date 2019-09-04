const getItemPosition = element => new Promise((resolve) => {
  element.measure((fx, fy, width, height, px, py) => {
    resolve({
      width,
      height,
      x: px,
      y: py,
    });
  });
});

export default getItemPosition;
