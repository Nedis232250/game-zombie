function radians(degrees) {
    return degrees * (Math.PI / 180);
}

class Cone {
    constructor(resolution, height, radius) {
        this.resolution = resolution;
        this.height = height;
        this.radius = radius;
    }

    vertices() {
        const vertices = [[0, this.height, 0], [0, 0, 0]];
        const indices = [];

        for (let i = 0; i < this.resolution; i++) {
            vertices.push([Math.sin(radians((360 / this.resolution) * i - 360 / this.resolution)) * this.radius, 0, Math.cos(radians((360 / this.resolution) * i - 360 / this.resolution)) * this.radius]);
        }

        for (let i = 0; i < this.resolution; i++) {
            if (i != this.resolution - 1) {
                indices.push(0, 2 + i, 3 + i, 1, 2 + i, 3 + i);
                
                continue;
            }

            indices.push(0, 2 + i, 2, 1, 2 + i, 2);
        }

        return [vertices, indices];
    }
};
