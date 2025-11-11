import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiUser, FiMail } from 'react-icons/fi';
import {
  Loading,
  CustomButton,
  CustomInput,
  CustomCard,
  CustomModal,
  CustomBadge,
  CustomAlert,
  CustomSelect
} from '../components/common';

function ComponentDemo() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' }
  ];

  return (
    <Container className="py-5">
      <h1 className="mb-4">Design System Components</h1>

      {/* Alerts */}
      <CustomCard title="Alerts" className="mb-4">
        <Row className="g-3">
          <Col xs={12}>
            <CustomAlert variant="success" title="Success!">
              This is a success alert with icon
            </CustomAlert>
          </Col>
          <Col xs={12}>
            <CustomAlert variant="danger" title="Error!">
              This is a danger alert
            </CustomAlert>
          </Col>
          <Col xs={12}>
            <CustomAlert variant="warning" dismissible>
              This is a dismissible warning alert
            </CustomAlert>
          </Col>
          <Col xs={12}>
            <CustomAlert variant="info" icon={false}>
              This is an info alert without icon
            </CustomAlert>
          </Col>
        </Row>
      </CustomCard>

      {/* Buttons */}
      <CustomCard title="Buttons" className="mb-4">
        <div className="d-flex flex-wrap gap-2 mb-3">
          <CustomButton variant="primary">Primary</CustomButton>
          <CustomButton variant="secondary">Secondary</CustomButton>
          <CustomButton variant="success">Success</CustomButton>
          <CustomButton variant="danger">Danger</CustomButton>
          <CustomButton variant="warning">Warning</CustomButton>
          <CustomButton variant="info">Info</CustomButton>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <CustomButton variant="outline-primary">Outline</CustomButton>
          <CustomButton variant="primary" size="sm">Small</CustomButton>
          <CustomButton variant="primary" size="lg">Large</CustomButton>
          <CustomButton variant="primary" loading>Loading</CustomButton>
          <CustomButton variant="primary" disabled>Disabled</CustomButton>
        </div>
        <div>
          <CustomButton variant="primary" icon={<FiUser />}>
            With Icon
          </CustomButton>
        </div>
      </CustomCard>

      {/* Badges */}
      <CustomCard title="Badges" className="mb-4">
        <div className="d-flex flex-wrap gap-2 mb-3">
          <CustomBadge variant="primary">Primary</CustomBadge>
          <CustomBadge variant="secondary">Secondary</CustomBadge>
          <CustomBadge variant="success">Success</CustomBadge>
          <CustomBadge variant="danger">Danger</CustomBadge>
          <CustomBadge variant="warning" className="text-dark">Warning</CustomBadge>
          <CustomBadge variant="info">Info</CustomBadge>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <CustomBadge variant="primary" pill>Pill Badge</CustomBadge>
          <CustomBadge variant="success" icon={<FiUser />}>With Icon</CustomBadge>
        </div>
      </CustomCard>

      {/* Inputs */}
      <CustomCard title="Form Inputs" className="mb-4">
        <Row>
          <Col md={6}>
            <CustomInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              required
              icon={<FiMail />}
            />
          </Col>
          <Col md={6}>
            <CustomInput
              label="Password"
              type="password"
              placeholder="••••••••"
              helpText="Tối thiểu 8 ký tự"
            />
          </Col>
          <Col md={6}>
            <CustomInput
              label="Error Example"
              placeholder="Input with error"
              error="This field is required"
            />
          </Col>
          <Col md={6}>
            <CustomSelect
              label="Select Option"
              options={selectOptions}
              required
            />
          </Col>
        </Row>
      </CustomCard>

      {/* Loading */}
      <CustomCard title="Loading States" className="mb-4">
        <Row className="g-4">
          <Col md={4}>
            <Loading size="sm" text="Small" />
          </Col>
          <Col md={4}>
            <Loading size="md" text="Medium" />
          </Col>
          <Col md={4}>
            <Loading size="lg" text="Large" />
          </Col>
        </Row>
      </CustomCard>

      {/* Modal */}
      <CustomCard title="Modal" className="mb-4">
        <CustomButton onClick={() => setShowModal(true)}>
          Open Modal
        </CustomButton>

        <CustomModal
          show={showModal}
          onHide={() => setShowModal(false)}
          title="Example Modal"
          onConfirm={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setShowModal(false);
            }, 1500);
          }}
          loading={loading}
        >
          <p>This is a modal example with confirm and cancel buttons.</p>
          <CustomAlert variant="info">
            You can add any content here!
          </CustomAlert>
        </CustomModal>
      </CustomCard>

      {/* Cards */}
      <Row className="g-4">
        <Col md={4}>
          <CustomCard title="Simple Card" hover>
            This is a card with hover effect
          </CustomCard>
        </Col>
        <Col md={4}>
          <CustomCard 
            title="Card with Subtitle" 
            subtitle="This is a subtitle"
          >
            Card content here
          </CustomCard>
        </Col>
        <Col md={4}>
          <CustomCard 
            title="Card with Footer"
            footer={<small className="text-muted">Footer text</small>}
          >
            Card with footer
          </CustomCard>
        </Col>
      </Row>
    </Container>
  );
}

export default ComponentDemo;
